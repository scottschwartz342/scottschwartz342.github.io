import { useEffect, useRef, useState } from 'react';

import { createInkFluid } from './inkFluid';
import './components.css';

/* Both layers animate — the aurora on its own clock, the ink in response to the
   cursor — which is exactly the motion the reduced-motion preference exists to
   suppress. Read once on mount: the background is decorative, so it isn't worth
   subscribing to changes mid-session. */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    /* Returns null where WebGL2 or renderable float textures are missing. The
       container keeps a CSS gradient behind the canvas for exactly this case, so
       there is nothing to swap in — just stop painting over it. */
    const fluid = createInkFluid(canvas, { reducedMotion: prefersReducedMotion() });
    if (!fluid) {
      setUnavailable(true);
      return;
    }

    return () => fluid.destroy();
  }, []);

  return (
    <div className="shaderBackground isStatic">
      {!unavailable && <canvas ref={canvasRef} className="shaderCanvas" />}
    </div>
  );
};

export default ShaderBackground;
