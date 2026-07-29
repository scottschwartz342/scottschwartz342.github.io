/* A cursor-driven ink simulation with an ambient aurora behind it, in plain
   WebGL2 with no dependencies.

   The fluid is the standard Stam-style solver run on the GPU: splat impulses
   where the pointer moves, advect velocity through itself, project it back to
   divergence-free with a Jacobi pressure solve, then advect the dye through the
   result. Vorticity confinement adds back the small-scale swirl that advection
   numerically damps out.

   Everything renders into a single canvas: the display pass draws the aurora as
   its background and adds the dye on top, so there is one context and one
   render loop rather than two stacked canvases. */

/* Velocity and pressure run at a much lower resolution than the dye. The eye
   reads detail in the color, not in the flow field, and the Jacobi solve is by
   far the most expensive part — this is the single biggest lever on cost. */
const SIM_RESOLUTION = 128;
const DYE_RESOLUTION = 512;
const PRESSURE_ITERATIONS = 20;

/* Dissipation is per-second decay: dye fades fast enough that strokes don't
   accumulate into mud, velocity slowly enough that motion carries after the
   cursor stops. */
const DYE_DISSIPATION = 1.2;
const VELOCITY_DISSIPATION = 0.35;
const PRESSURE_DISSIPATION = 0.8;
const CURL_STRENGTH = 12;

const SPLAT_RADIUS = 0.0025;
const SPLAT_FORCE = 6000;

/* Guards a long tab-switch or a breakpoint from advecting the field by one huge
   timestep, which blows the simulation apart. */
const MAX_FRAME_TIME = 1 / 30;

/* Playback speed for each layer, as a multiplier on time. Scaling the fluid's
   timestep rather than weakening its forces slows the motion without changing
   its shape — strokes travel and curl exactly as before, just less hurriedly,
   and because dissipation is applied per timestep the ink lingers proportionally
   longer instead of vanishing at the old rate. */
const AURORA_SPEED = 0.6;
const FLUID_SPEED = 0.65;

const VERT = `#version 300 es
precision highp float;
in vec2 aPos;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
uniform vec2 uTexel;
void main() {
  vUv = aPos * 0.5 + 0.5;
  vL = vUv - vec2(uTexel.x, 0.0);
  vR = vUv + vec2(uTexel.x, 0.0);
  vT = vUv + vec2(0.0, uTexel.y);
  vB = vUv - vec2(0.0, uTexel.y);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG_HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
`;

const SPLAT_FRAG = `${FRAG_HEAD}
uniform sampler2D uTarget;
uniform float uAspect;
uniform vec3 uColor;
uniform vec2 uPoint;
uniform float uRadius;
void main() {
  vec2 p = vUv - uPoint;
  p.x *= uAspect;
  vec3 splat = exp(-dot(p, p) / uRadius) * uColor;
  vec3 base = texture(uTarget, vUv).xyz;
  fragColor = vec4(base + splat, 1.0);
}`;

/* Semi-Lagrangian advection: trace backwards along the velocity field and read
   whatever was there, which is unconditionally stable at any timestep. */
const ADVECTION_FRAG = `${FRAG_HEAD}
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uTexelSize;
uniform float uDt;
uniform float uDissipation;
void main() {
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uTexelSize;
  vec4 result = texture(uSource, coord);
  float decay = 1.0 + uDissipation * uDt;
  fragColor = result / decay;
}`;

const DIVERGENCE_FRAG = `${FRAG_HEAD}
uniform sampler2D uVelocity;
void main() {
  float L = texture(uVelocity, vL).x;
  float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y;
  float B = texture(uVelocity, vB).y;
  fragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

const CURL_FRAG = `${FRAG_HEAD}
uniform sampler2D uVelocity;
void main() {
  float L = texture(uVelocity, vL).y;
  float R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x;
  float B = texture(uVelocity, vB).x;
  fragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`;

/* Vorticity confinement: push velocity back toward local spin centers to
   restore the curl that advection smears away. */
const VORTICITY_FRAG = `${FRAG_HEAD}
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float uCurlStrength;
uniform float uDt;
void main() {
  float L = texture(uCurl, vL).x;
  float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x;
  float B = texture(uCurl, vB).x;
  float C = texture(uCurl, vUv).x;

  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= uCurlStrength * C;
  force.y *= -1.0;

  vec2 velocity = texture(uVelocity, vUv).xy + force * uDt;
  fragColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);
}`;

const PRESSURE_FRAG = `${FRAG_HEAD}
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main() {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  float divergence = texture(uDivergence, vUv).x;
  fragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
}`;

const GRADIENT_SUBTRACT_FRAG = `${FRAG_HEAD}
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main() {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  vec2 velocity = texture(uVelocity, vUv).xy - vec2(R - L, T - B);
  fragColor = vec4(velocity, 0.0, 1.0);
}`;

const CLEAR_FRAG = `${FRAG_HEAD}
uniform sampler2D uTexture;
uniform float uValue;
void main() {
  fragColor = uValue * texture(uTexture, vUv);
}`;

/* The aurora is value-noise fbm shaped into a few bottom-anchored curtains,
   which is cheap enough to evaluate per-pixel per-frame alongside the fluid.
   The dye is added rather than blended so ink reads as light over it. */
const DISPLAY_FRAG = `${FRAG_HEAD}
uniform sampler2D uDye;
uniform float uTime;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

vec3 aurora(vec2 uv, float t) {
  vec3 col = vec3(0.0);
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float wave = fbm(vec2(uv.x * 2.5 + fi * 3.7, t * 0.08 + fi * 1.3));
    float band = uv.y - (0.04 + wave * 0.28);
    /* Tighter falloff and a lower ceiling than a standalone aurora would want.
       This sits under the ink, so its job is to keep the page from being flat
       black — spread over too much area it stops reading as a glow and starts
       reading as the background color. */
    float glow = exp(-abs(band) * 10.0) * 0.26;
    glow *= 0.6 + 0.4 * fbm(vec2(uv.x * 18.0 + fi * 5.0, t * 0.15));
    /* Both ends kept in the violet family. A cyan end read as a blue wash and
       competed with the ink, which owns the saturated color here. */
    vec3 tint = mix(vec3(0.22, 0.09, 0.30), vec3(0.12, 0.08, 0.20), fi * 0.5);
    col += tint * glow;
  }
  return col * smoothstep(0.72, 0.02, uv.y);
}

void main() {
  vec3 col = aurora(vUv, uTime) + texture(uDye, vUv).rgb;
  fragColor = vec4(col, 1.0);
}`;

type Framebuffer = {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
};

type DoubleFramebuffer = {
  read: Framebuffer;
  write: Framebuffer;
  swap: () => void;
};

const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? 'shader compile failed');
  }
  return shader;
};

/* Uniform locations are looked up once and cached by name — getUniformLocation
   is a synchronous driver call and this would otherwise run it several hundred
   times a second. */
const buildProgram = (gl: WebGL2RenderingContext, fragSource: string) => {
  const program = gl.createProgram()!;
  const vert = compile(gl, gl.VERTEX_SHADER, VERT);
  const frag = compile(gl, gl.FRAGMENT_SHADER, fragSource);
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  /* Pinned before linking because the shared VAO feeds location 0. Left to the
     driver this happens to work while aPos is the only attribute, but it isn't
     guaranteed and would fail silently as a black screen. */
  gl.bindAttribLocation(program, 0, 'aPos');
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? 'program link failed');
  }
  /* Flagged for deletion now; the driver frees them once the program that links
     them is itself deleted. */
  gl.deleteShader(vert);
  gl.deleteShader(frag);

  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < count; i++) {
    const name = gl.getActiveUniform(program, i)!.name;
    uniforms[name] = gl.getUniformLocation(program, name);
  }

  return { program, uniforms };
};

export type InkFluidHandle = { destroy: () => void };

/* Returns null when WebGL2 or renderable float textures aren't available, which
   is the caller's cue to leave its static fallback in place. */
export const createInkFluid = (
  canvas: HTMLCanvasElement,
  { reducedMotion = false }: { reducedMotion?: boolean } = {},
): InkFluidHandle | null => {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    depth: false,
    stencil: false,
    antialias: false,
    powerPreference: 'high-performance',
  });

  if (!gl) {
    return null;
  }

  /* The solver keeps its state in float textures, which WebGL2 can sample but
     cannot render to without one of these. Half float is enough precision and
     is the cheaper of the two. */
  const halfFloat =
    gl.getExtension('EXT_color_buffer_half_float') ?? gl.getExtension('EXT_color_buffer_float');
  if (!halfFloat) {
    return null;
  }

  const quad = gl.createVertexArray();
  gl.bindVertexArray(quad);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const programs = {
    splat: buildProgram(gl, SPLAT_FRAG),
    advection: buildProgram(gl, ADVECTION_FRAG),
    divergence: buildProgram(gl, DIVERGENCE_FRAG),
    curl: buildProgram(gl, CURL_FRAG),
    vorticity: buildProgram(gl, VORTICITY_FRAG),
    pressure: buildProgram(gl, PRESSURE_FRAG),
    gradientSubtract: buildProgram(gl, GRADIENT_SUBTRACT_FRAG),
    clear: buildProgram(gl, CLEAR_FRAG),
    display: buildProgram(gl, DISPLAY_FRAG),
  };

  /* Tracked so destroy() can free them individually. The tempting shortcut —
     WEBGL_lose_context — permanently poisons the canvas element, and React
     remounts effects against the same element, so the second mount would find a
     dead context and give up for good. */
  const textures: WebGLTexture[] = [];
  const framebuffers: WebGLFramebuffer[] = [];

  const createFBO = (
    width: number,
    height: number,
    internalFormat: number,
    format: number,
  ): Framebuffer => {
    const texture = gl.createTexture()!;
    textures.push(texture);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, gl.HALF_FLOAT, null);

    const fbo = gl.createFramebuffer()!;
    framebuffers.push(fbo);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return {
      texture,
      fbo,
      width,
      height,
      texelSizeX: 1 / width,
      texelSizeY: 1 / height,
      attach(id: number) {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      },
    };
  };

  const createDoubleFBO = (
    width: number,
    height: number,
    internalFormat: number,
    format: number,
  ): DoubleFramebuffer => ({
    read: createFBO(width, height, internalFormat, format),
    write: createFBO(width, height, internalFormat, format),
    swap() {
      const temp = this.read;
      this.read = this.write;
      this.write = temp;
    },
  });

  /* Sim buffers are sized to the viewport's aspect, not its pixel count — the
     field only needs enough cells to look continuous, and decoupling it from
     devicePixelRatio keeps the cost identical on a retina display. */
  const aspect = () => canvas.clientWidth / Math.max(canvas.clientHeight, 1);
  const dims = (resolution: number) => {
    const ratio = aspect();
    return ratio > 1
      ? { width: Math.round(resolution * ratio), height: resolution }
      : { width: resolution, height: Math.round(resolution / ratio) };
  };

  const sim = dims(SIM_RESOLUTION);
  const dyeDims = dims(DYE_RESOLUTION);

  const dye = createDoubleFBO(dyeDims.width, dyeDims.height, gl.RGBA16F, gl.RGBA);
  const velocity = createDoubleFBO(sim.width, sim.height, gl.RG16F, gl.RG);
  const divergence = createFBO(sim.width, sim.height, gl.R16F, gl.RED);
  const curl = createFBO(sim.width, sim.height, gl.R16F, gl.RED);
  const pressure = createDoubleFBO(sim.width, sim.height, gl.R16F, gl.RED);

  const blit = (target: Framebuffer | null) => {
    if (target) {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    } else {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  /* uTexel feeds the vertex shader's neighbour offsets, so every pass has to set
     it to the resolution it is actually sampling or the stencils sample the
     wrong cells. */
  const bindPass = ({ program, uniforms }: ReturnType<typeof buildProgram>, texelSource: Framebuffer) => {
    gl.useProgram(program);
    gl.uniform2f(uniforms['uTexel'] ?? null, texelSource.texelSizeX, texelSource.texelSizeY);
    return uniforms;
  };

  let pointerX = 0.5;
  let pointerY = 0.5;
  let pointerDx = 0;
  let pointerDy = 0;
  let pointerMoved = false;
  let hue = 0;

  const onPointerMove = (event: PointerEvent | MouseEvent) => {
    const x = event.clientX / window.innerWidth;
    const y = 1 - event.clientY / window.innerHeight;
    /* Scaled by the viewport aspect so a diagonal flick pushes the fluid in the
       direction it visually travelled rather than being skewed by the window. */
    pointerDx = (x - pointerX) * SPLAT_FORCE * aspect();
    pointerDy = (y - pointerY) * SPLAT_FORCE;
    pointerX = x;
    pointerY = y;
    pointerMoved = true;
  };

  /* Bound to window rather than the canvas so the layer can stay
     pointer-events: none and let the page underneath keep every gesture. */
  if (!reducedMotion) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
  }

  const splat = () => {
    /* Cycling hue per splat is what makes a stroke sweep the spectrum rather
       than come out one flat color. */
    hue = (hue + 0.006) % 1;
    const h = hue * 6;
    /* Deliberately dim. Splats accumulate additively where a stroke overlaps
       itself, and once a channel clips at 1.0 the hue collapses toward white —
       so the ceiling has to leave headroom for the ink to stay colored. */
    const c = 0.1;
    const x = c * (1 - Math.abs((h % 2) - 1));
    const rgb =
      h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x]
      : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x];

    const splatUniforms = bindPass(programs.splat, velocity.read);
    gl.uniform1i(splatUniforms['uTarget'] ?? null, velocity.read.attach(0));
    gl.uniform1f(splatUniforms['uAspect'] ?? null, aspect());
    gl.uniform2f(splatUniforms['uPoint'] ?? null, pointerX, pointerY);
    gl.uniform3f(splatUniforms['uColor'] ?? null, pointerDx, pointerDy, 0);
    gl.uniform1f(splatUniforms['uRadius'] ?? null, SPLAT_RADIUS);
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(splatUniforms['uTarget'] ?? null, dye.read.attach(0));
    gl.uniform3f(splatUniforms['uColor'] ?? null, rgb[0], rgb[1], rgb[2]);
    blit(dye.write);
    dye.swap();
  };

  const step = (dt: number) => {
    const curlUniforms = bindPass(programs.curl, velocity.read);
    gl.uniform1i(curlUniforms['uVelocity'] ?? null, velocity.read.attach(0));
    blit(curl);

    const vorticityUniforms = bindPass(programs.vorticity, velocity.read);
    gl.uniform1i(vorticityUniforms['uVelocity'] ?? null, velocity.read.attach(0));
    gl.uniform1i(vorticityUniforms['uCurl'] ?? null, curl.attach(1));
    gl.uniform1f(vorticityUniforms['uCurlStrength'] ?? null, CURL_STRENGTH);
    gl.uniform1f(vorticityUniforms['uDt'] ?? null, dt);
    blit(velocity.write);
    velocity.swap();

    const divergenceUniforms = bindPass(programs.divergence, velocity.read);
    gl.uniform1i(divergenceUniforms['uVelocity'] ?? null, velocity.read.attach(0));
    blit(divergence);

    /* Carrying a decayed pressure field into the next frame gives the solver a
       warm start, so 20 iterations converge as well as far more from zero. */
    const clearUniforms = bindPass(programs.clear, pressure.read);
    gl.uniform1i(clearUniforms['uTexture'] ?? null, pressure.read.attach(0));
    gl.uniform1f(clearUniforms['uValue'] ?? null, PRESSURE_DISSIPATION);
    blit(pressure.write);
    pressure.swap();

    const pressureUniforms = bindPass(programs.pressure, velocity.read);
    gl.uniform1i(pressureUniforms['uDivergence'] ?? null, divergence.attach(0));
    for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(pressureUniforms['uPressure'] ?? null, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    const gradientUniforms = bindPass(programs.gradientSubtract, velocity.read);
    gl.uniform1i(gradientUniforms['uPressure'] ?? null, pressure.read.attach(0));
    gl.uniform1i(gradientUniforms['uVelocity'] ?? null, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    const advectionUniforms = bindPass(programs.advection, velocity.read);
    gl.uniform2f(
      advectionUniforms['uTexelSize'] ?? null,
      velocity.read.texelSizeX,
      velocity.read.texelSizeY,
    );
    gl.uniform1f(advectionUniforms['uDt'] ?? null, dt);
    gl.uniform1i(advectionUniforms['uVelocity'] ?? null, velocity.read.attach(0));
    gl.uniform1i(advectionUniforms['uSource'] ?? null, velocity.read.attach(0));
    gl.uniform1f(advectionUniforms['uDissipation'] ?? null, VELOCITY_DISSIPATION);
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(advectionUniforms['uVelocity'] ?? null, velocity.read.attach(0));
    gl.uniform1i(advectionUniforms['uSource'] ?? null, dye.read.attach(1));
    gl.uniform1f(advectionUniforms['uDissipation'] ?? null, DYE_DISSIPATION);
    blit(dye.write);
    dye.swap();
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(canvas.clientWidth * dpr);
    const height = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  };

  let raf = 0;
  let lastTime = performance.now();
  let elapsed = 0;
  let running = true;

  const render = (now: number) => {
    const dt = Math.min((now - lastTime) / 1000, MAX_FRAME_TIME);
    lastTime = now;
    elapsed += dt;

    resize();
    gl.bindVertexArray(quad);

    if (!reducedMotion) {
      if (pointerMoved) {
        pointerMoved = false;
        splat();
      }
      step(dt * FLUID_SPEED);
    }

    const displayUniforms = bindPass(programs.display, dye.read);
    gl.uniform1i(displayUniforms['uDye'] ?? null, dye.read.attach(0));
    gl.uniform1f(displayUniforms['uTime'] ?? null, elapsed * AURORA_SPEED);
    blit(null);

    if (running) {
      raf = requestAnimationFrame(render);
    }
  };

  /* A hidden tab still runs rAF in some browsers, and there is nothing to see
     either way — stopping outright avoids burning the GPU in a background
     window. */
  const onVisibility = () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (!running) {
      running = true;
      lastTime = performance.now();
      raf = requestAnimationFrame(render);
    }
  };
  document.addEventListener('visibilitychange', onVisibility);

  resize();
  raf = requestAnimationFrame(render);

  return {
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibility);

      textures.forEach((texture) => gl.deleteTexture(texture));
      framebuffers.forEach((fbo) => gl.deleteFramebuffer(fbo));
      Object.values(programs).forEach(({ program }) => gl.deleteProgram(program));
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(quad);
    },
  };
};
