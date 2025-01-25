import React, { useEffect, useRef, useState } from "react";
import "../../utils/ProjectImages.css";

interface ProjectImagesProps {
  children: React.ReactNode;
  className?: string;
  numCards: number;
}

const ProjectImages: React.FC<ProjectImagesProps> = ({
  children,
  className,
  numCards,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState(0);
  const [clientWidth, setClientWidth] = useState(800);
  const [currentCard, setCurrentCard] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoPlay = () => {
    if (timeoutRef.current) {
      clearInterval(timeoutRef.current);
    }
    timeoutRef.current = setInterval(() => {
      scrollNext();
    }, 10000);
  };

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!reduceMotion && numCards > 1) startAutoPlay();
    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, [numCards]);

  useEffect(() => {
    const newCard = Math.round(scroll / clientWidth);
    setCurrentCard(newCard);
  }, [scroll, clientWidth]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScroll(e.currentTarget.scrollLeft);
  };

  const scrollTo = (card: number) => {
    if (!containerRef.current) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) {
      setClientWidth((prevWidth) => {
        if (containerRef && containerRef.current)
          containerRef.current.scrollLeft = card * prevWidth;
        return prevWidth;
      });
      return;
    }
    setClientWidth((prevWidth) => {
      if (containerRef && containerRef.current)
        containerRef.current.scrollTo({
          left: card * prevWidth,
          behavior: "smooth",
        });
      return prevWidth;
    });
  };

  const clickTo = (card: number) => {
    scrollTo(card);
    startAutoPlay();
  };

  const scrollNext = () => {
    setCurrentCard((prevCard) => {
      const nextCard = (prevCard + 1) % numCards;
      scrollTo(nextCard);
      return nextCard;
    });
  };

  const clickNext = () => {
    scrollNext();
    startAutoPlay();
  };

  const scrollPrev = () => {
    setCurrentCard((prevCard) => {
      const prevCardIndex = (prevCard - 1 + numCards) % numCards;
      scrollTo(prevCardIndex);
      return prevCardIndex;
    });
  };

  const clickPrev = () => {
    scrollPrev();
    startAutoPlay();
  };

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setClientWidth(containerRef.current.clientWidth);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-md ${className}`}>
      <div
        className="embla overflow-x-scroll no-scrollbar overflow-y-hidden flex aspect-video bg-gray-100 items-center snap-x snap-mandatory"
        onScroll={onScroll}
        ref={containerRef}
      >
        {children}
      </div>
      {numCards > 1 && (
        <>
          <button
            className="absolute group left-0 top-0 bottom-0 flex items-center w-[30%]"
            onClick={clickPrev}
            title="Previous image"
            aria-label="Previous image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="size-6 sm:size-8 ml-1 sm:ml-4 text-white sm:text-transparent group-hover:text-white z-10 motion-safe:transition-colors motion-safe:duration-100"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
            <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-black/30 to-transparent to-70% -translate-x-full sm:group-hover:translate-x-0 motion-safe:transition-transform motion-safe:duration-100"></div>
          </button>
          <button
            className="absolute group right-0 top-0 bottom-0 flex items-center w-[30%] justify-end"
            onClick={clickNext}
            title="Next image"
            aria-label="Next image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="size-6 sm:size-8 mr-1 sm:mr-4 text-white sm:text-transparent group-hover:text-white z-10 motion-safe:transition-colors motion-safe:duration-100"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
            <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-l from-black/30 to-transparent to-70% translate-x-full sm:group-hover:translate-x-0 motion-safe:transition-transform motion-safe:duration-100"></div>
          </button>
          <div>
            <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 flex justify-center space-x-1 sm:space-x-3 group">
              {Array.from({ length: numCards }, (_, i) => (
                <button
                  key={i}
                  className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full hover:bg-white/80 motion-safe:transition-colors motion-safe:duration-100 ${
                    i === currentCard ? "bg-white" : "bg-white/50"
                  }`}
                  onClick={() => clickTo(i)}
                  title={`Go to image ${i + 1}`}
                  aria-label={`Go to image ${i + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectImages;
