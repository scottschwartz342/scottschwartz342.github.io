import { useRef } from 'react';
import { Carousel, Flex } from 'antd';
import type { CarouselRef } from 'antd/es/carousel';

import Info from './Info';
import { Option } from './Option';
import Options from './Options';
import Projects from './Projects';
import Resume from './Resume';

/* Slide order below has to match these indices — the Options buttons name a
   target rather than a number so the mapping lives in one place. Record<Option,
   number> means adding a case to Option without adding it here is a type
   error. */
const SLIDE_INDEX: Record<Option, number> = {
  [Option.Info]: 1,
  [Option.Projects]: 2,
  [Option.Resume]: 3,
};

/* Trackpads emit a long tail of momentum events per gesture, so one flick would
   otherwise skate through every slide. Ignore wheel input for this long after
   acting on it. */
const WHEEL_COOLDOWN_MS = 600;

/* True when something between `start` and `boundary` can still scroll in the
   wheel's direction — the Info/Projects frames set overflowY themselves, and
   they should consume the gesture until they bottom out rather than having the
   carousel yank the slide away mid-read. */
const scrollableUnderCursor = (
  start: HTMLElement | null,
  delta: number,
  boundary: HTMLElement,
) => {
  for (let node = start; node && node !== boundary; node = node.parentElement) {
    const { overflowY } = window.getComputedStyle(node);
    const scrolls = overflowY === 'auto' || overflowY === 'scroll';

    if (scrolls && node.scrollHeight > node.clientHeight) {
      const atTop = node.scrollTop <= 0;
      const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;

      if (delta > 0 ? !atBottom : !atTop) {
        return true;
      }
    }
  }

  return false;
};

const CustomCarousel = () => {
    const carouselRef = useRef<CarouselRef>(null);
    const wheelLockedRef = useRef(false);

    const onChange = (currentSlide: number) => {
        console.log(currentSlide);
    };

    const goToSlide = (target: Option) => {
        carouselRef.current?.goTo(SLIDE_INDEX[target]);
    };

    const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        // Horizontal trackpad swipes should move the carousel too, so take
        // whichever axis the gesture leaned on.
        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;

        if (delta === 0) {
            return;
        }

        if (scrollableUnderCursor(event.target as HTMLElement, delta, event.currentTarget)) {
            return;
        }

        if (wheelLockedRef.current) {
            return;
        }

        wheelLockedRef.current = true;
        window.setTimeout(() => {
            wheelLockedRef.current = false;
        }, WHEEL_COOLDOWN_MS);

        if (delta > 0) {
            carouselRef.current?.next();
        } else {
            carouselRef.current?.prev();
        }
    };

    const slideStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
    };

    return (
      <div onWheel={onWheel} style={{ height: '100vh' }}>
        <Carousel ref={carouselRef} dotPlacement={'end'} style={{ height: '100vh', width: '100%' }} afterChange={onChange} arrows>
          <div>
            <Flex style={slideStyle}>
              <Options onNavigate={goToSlide} />
            </Flex>
          </div>
          <div>
            <Flex style={slideStyle}>
              <Info />
            </Flex>
          </div>
          <div>
            <Flex style={slideStyle}>
              <Projects />
            </Flex>
          </div>
          <div>
            <Flex style={slideStyle}>
              <Resume />
            </Flex>
          </div>
        </Carousel>
      </div>
  );
};

export default CustomCarousel;
