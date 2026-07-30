import { useEffect, useRef, useState } from 'react';

import Info from './Info';
import { Option } from './Option';
import Options from './Options';
import Projects from './Projects';
import Resume from './Resume';
import './components.css';

/* Slide order below has to match these indices — the Options buttons name a
   target rather than a number so the mapping lives in one place. Record<Option,
   number> means adding a case to Option without adding it here is a type
   error. */
const SLIDE_INDEX: Record<Option, number> = {
  [Option.Info]: 1,
  [Option.Projects]: 2,
  [Option.Resume]: 3,
};

/* Labels for the dots and for the slides themselves, so the rail is navigable
   by something other than sight. Length defines the slide count. */
const SLIDE_LABELS = [
  'Home',
  'Contact information and about me',
  'Projects',
  'Resume',
];

/* Share of the rail a slide has to cover to count as the current one. Anything
   above half means only one slide can ever qualify, so the dots can't flicker
   between two of them mid-scroll. */
const ACTIVE_RATIO = 0.6;

const Chevron = ({ pointing }: { pointing: 'up' | 'down' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d={pointing === 'up' ? 'M5 15l7-7 7 7' : 'M5 9l7 7 7-7'} />
  </svg>
);

/* Scrolling between slides is the browser's job here, not ours: the rail is a
   real scroll container and CSS scroll-snap does the snapping. That's the whole
   design. Trackpad momentum, rubber-banding and "was that flick hard enough"
   are exactly what a hand-written wheel handler gets wrong and what the
   platform's own scrolling gets right, so there is deliberately no wheel,
   touch or keyboard handling below — only the dots and arrows, which drive the
   same native scrolling through scrollIntoView. */
const CustomCarousel = () => {
    const railRef = useRef<HTMLDivElement>(null);
    const slidesRef = useRef<(HTMLElement | null)[]>([]);
    const [activeSlide, setActiveSlide] = useState(0);

    /* Which slide is showing is a fact about scroll position, so it's observed
       rather than tracked — the dots stay right whether the move came from a
       flick, a dot, an arrow or the keyboard. */
    useEffect(() => {
        const rail = railRef.current;

        if (!rail) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveSlide(slidesRef.current.indexOf(entry.target as HTMLElement));
                    }
                }
            },
            { root: rail, threshold: ACTIVE_RATIO },
        );

        for (const slide of slidesRef.current) {
            if (slide) {
                observer.observe(slide);
            }
        }

        return () => observer.disconnect();
    }, []);

    const goTo = (index: number) => {
        slidesRef.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const goToSlide = (target: Option) => {
        goTo(SLIDE_INDEX[target]);
    };

    const slides = [
      <Options onNavigate={goToSlide} />,
      <Info />,
      <Projects />,
      <Resume />,
    ];

    const lastSlide = SLIDE_LABELS.length - 1;

    return (
      <>
        <div className="rail" ref={railRef} tabIndex={0} role="region" aria-label="Sections">
          {slides.map((content, index) => (
            <section
              key={SLIDE_LABELS[index]}
              className="railSlide"
              aria-label={SLIDE_LABELS[index]}
              ref={(node) => {
                slidesRef.current[index] = node;
              }}
            >
              {content}
            </section>
          ))}
        </div>

        <button
          type="button"
          className="railArrow railArrowUp"
          onClick={() => goTo(activeSlide - 1)}
          disabled={activeSlide === 0}
          aria-label="Previous section"
        >
          <Chevron pointing="up" />
        </button>

        <button
          type="button"
          className="railArrow railArrowDown"
          onClick={() => goTo(activeSlide + 1)}
          disabled={activeSlide === lastSlide}
          aria-label="Next section"
        >
          <Chevron pointing="down" />
        </button>

        <nav className="railDots" aria-label="Sections">
          {SLIDE_LABELS.map((label, index) => (
            <button
              key={label}
              type="button"
              className={index === activeSlide ? 'railDot railDotActive' : 'railDot'}
              onClick={() => goTo(index)}
              aria-label={label}
              aria-current={index === activeSlide}
            />
          ))}
        </nav>
      </>
  );
};

export default CustomCarousel;
