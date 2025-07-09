import { useEffect, useRef, useState } from "react";
import { genKeyframes } from "../lib/landing-animations";

export default function Landing() {
  const [scrollPercent, setScrollPercent] = useState(0);

  const textGreet = useRef<HTMLParagraphElement>(null);
  const textName = useRef<HTMLParagraphElement>(null);
  const textDesc = useRef<HTMLParagraphElement>(null);
  const textLinks = useRef<HTMLParagraphElement>(null);

  const defaultTextHeightRem = 2.25;
  const [defaultTextHeight, setDefaultTextHeight] = useState(0);
  const [greetHeight, setGreetHeight] = useState(0);
  const [nameHeight, setNameHeight] = useState(0);
  const [descHeight, setDescHeight] = useState(0);
  const [linksHeight, setLinksHeight] = useState(0);

  const [greetTranslateY, setGreetTranslateY] = useState(0);
  const [nameTranslateY, setNameTranslateY] = useState(0);
  const [descTranslateY, setDescTranslateY] = useState(0);
  const [linksTranslateY, setLinksTranslateY] = useState(0);

  const [greetOpacity, setGreetOpacity] = useState(1);
  const [nameOpacity, setNameOpacity] = useState(0);
  const [descOpacity, setDescOpacity] = useState(0);
  const [linksOpacity, setLinksOpacity] = useState(0);
  const [contentOpacity, setContentOpacity] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const calculateScrollPercent = () => {
      setScrollPercent(
        window.pageYOffset / (document.body.scrollHeight - window.innerHeight)
      );
    };

    window.addEventListener("resize", calculateScrollPercent);
    window.addEventListener("scroll", calculateScrollPercent);
    calculateScrollPercent();

    return () => {
      window.removeEventListener("resize", calculateScrollPercent);
      window.removeEventListener("scroll", calculateScrollPercent);
    };
  }, []);

  useEffect(() => {
    const calculateHeights = () => {
      const defaultHeight =
        defaultTextHeightRem *
        parseFloat(getComputedStyle(document.documentElement).fontSize);
      setDefaultTextHeight(defaultHeight);

      if (!textGreet.current) return;
      setGreetHeight(textGreet.current.offsetHeight || defaultHeight);
      if (!textName.current) return;
      setNameHeight(textName.current.offsetHeight || defaultHeight);
      if (!textDesc.current) return;
      setDescHeight(textDesc.current.offsetHeight || defaultHeight);
      if (!textLinks.current) return;
      setLinksHeight(textLinks.current.offsetHeight || defaultHeight);
    };

    window.addEventListener("resize", calculateHeights);
    calculateHeights();

    return () => {
      window.removeEventListener("resize", calculateHeights);
    };
  }, []);

  function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  useEffect(() => {
    if (
      !textGreet.current ||
      !textName.current ||
      !textDesc.current ||
      !textLinks.current
    )
      return;

    const {
      greetKeyframes,
      nameKeyframes,
      descKeyframes,
      linksKeyframes,
      contentKeyframes,
    } = genKeyframes(
      defaultTextHeight,
      greetHeight,
      nameHeight,
      descHeight,
      linksHeight
    );

    const keyframes = [
      {
        setTranslateY: setGreetTranslateY,
        setOpacity: setGreetOpacity,
        keyframes: greetKeyframes,
      },
      {
        setTranslateY: setNameTranslateY,
        setOpacity: setNameOpacity,
        keyframes: nameKeyframes,
      },
      {
        setTranslateY: setDescTranslateY,
        setOpacity: setDescOpacity,
        keyframes: descKeyframes,
      },
      {
        setTranslateY: setLinksTranslateY,
        setOpacity: setLinksOpacity,
        keyframes: linksKeyframes,
      },
      {
        setTranslateY: () => {},
        setOpacity: setContentOpacity,
        keyframes: contentKeyframes,
      },
    ];

    keyframes.map(({ setTranslateY, setOpacity, keyframes }) => {
      keyframes.forEach((keyframe) => {
        if (scrollPercent < keyframe.from || scrollPercent > keyframe.to)
          return;

        const translateYBounds = keyframe.translateY || [0, 0];
        const opacityBounds = keyframe.opacity || [1, 1];

        const animationPercent =
          (scrollPercent - keyframe.from) / (keyframe.to - keyframe.from);

        const translateY = lerp(
          translateYBounds[0],
          translateYBounds[1],
          animationPercent
        );
        const opacity = lerp(
          opacityBounds[0],
          opacityBounds[1],
          animationPercent
        );

        setTranslateY(translateY);
        setOpacity(opacity);
      });
    });
  }, [
    scrollPercent,
    defaultTextHeight,
    greetHeight,
    nameHeight,
    descHeight,
    linksHeight,
  ]);

  function skipToContent() {
    window.scrollTo(0, document.body.scrollHeight);
  }

  return (
    <div className="h-[300rem]">
      {contentOpacity < 1 && (
        <button
          className="text-sm fixed bottom-8 right-8 underline cursor-pointer z-10"
          tabIndex={1}
          style={{ opacity: 1 - contentOpacity }}
          onClick={skipToContent}
        >
          skip to content
        </button>
      )}
      <div className="fixed inset-0 h-screen flex items-center flex-col mx-12 text-3xl text-fg">
        <div className="h-full max-w-2xl w-full py-12 flex flex-col items-center justify-center relative text-center">
          <p
            className="absolute"
            ref={textGreet}
            style={{
              opacity: greetOpacity,
              transform: `translateY(${greetTranslateY}px)`,
            }}
          >
            hey there! 👋
          </p>
          <p
            className="absolute"
            style={{
              opacity: nameOpacity,
              transform: `translateY(${nameTranslateY}px)`,
            }}
            ref={textName}
          >
            i'm sam
          </p>
          <p
            className="absolute"
            style={{
              opacity: descOpacity,
              transform: `translateY(${descTranslateY}px)`,
            }}
            ref={textDesc}
          >
            i’m currently building things and experiences @ ---------
          </p>
          <p
            className="absolute"
            style={{
              opacity: linksOpacity,
              transform: `translateY(${linksTranslateY}px)`,
            }}
            ref={textLinks}
          >
            <a href="about">about</a> | <a href="work">work</a> |{" "}
            <a href="blog">blog</a> | <a href="contact">contact</a>
          </p>
          {contentOpacity < 1 && (
            <p
              className="absolute text-xl bottom-12"
              style={{ opacity: 1 - contentOpacity }}
            >
              scroll<br></br>↓
            </p>
          )}
        </div>
      </div>
      {contentOpacity > 0 && (
        <p
          className="text-xl fixed top-8 left-12"
          style={{ opacity: contentOpacity }}
        >
          samliu.dev
        </p>
      )}
    </div>
  );
}
