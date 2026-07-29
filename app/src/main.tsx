import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import './index.css'
import App from './App.tsx'

/* The carousel dots draw themselves from colorBgContainer — the track at 0.2
   opacity, the active fill at full — which assumes that colour contrasts with
   the slide behind it. Under the dark algorithm it resolves to #141414, so a
   near-black dot sits on a near-black page and disappears.

   These dots overlay the shader rather than any themed surface, so they want a
   light value whatever the algorithm is doing. Scoped to Carousel because
   colorBgContainer is used nowhere else in that component, and overriding it
   here beats fighting antd's own `.ant-carousel .slick-dots li button` on
   specificity. */
const carouselTokens = { colorBgContainer: '#ffffff' };

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: { borderRadius: 8 },
        components: { Carousel: carouselTokens },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
)
