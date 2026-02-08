import { useState, useRef, useCallback, useEffect } from "react";

interface UseAutoScrollOptions {
  minSpeed?: number;
  maxSpeed?: number;
  defaultSpeed?: number;
}

export function useAutoScroll(
  containerRef: React.RefObject<HTMLElement | null>,
  options: UseAutoScrollOptions = {}
) {
  const { minSpeed = 0.2, maxSpeed = 5, defaultSpeed = 1 } = options;
  const [isScrolling, setIsScrolling] = useState(false);
  const [speed, setSpeed] = useState(defaultSpeed);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const scroll = useCallback(
    (timestamp: number) => {
      if (!containerRef.current) return;

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }

      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Pixels per frame = speed * delta / 16.67 (normalize to 60fps)
      const pixels = speed * (delta / 16.67);
      containerRef.current.scrollTop += pixels;

      // Stop if we've reached the bottom
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 1) {
        setIsScrolling(false);
        return;
      }

      frameRef.current = requestAnimationFrame(scroll);
    },
    [speed, containerRef]
  );

  useEffect(() => {
    if (isScrolling) {
      lastTimeRef.current = 0;
      frameRef.current = requestAnimationFrame(scroll);
    } else {
      cancelAnimationFrame(frameRef.current);
    }

    return () => cancelAnimationFrame(frameRef.current);
  }, [isScrolling, scroll]);

  const toggleScroll = useCallback(() => {
    setIsScrolling((prev) => !prev);
  }, []);

  return {
    isScrolling,
    speed,
    setSpeed,
    toggleScroll,
    minSpeed,
    maxSpeed,
  };
}
