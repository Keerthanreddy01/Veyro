import { useEffect, useState, useMemo } from "react";

export function useMediaQuery<T>(breakpoints: T[]): T | null | "base" {
  const maxWidth = useMemo(() => ({
    base: 639,
    sm: 767,
    md: 1023,
    lg: 1279,
    xl: 1535,
    "2xl": Infinity,
  }), []);

  const sortedBreakpoints = useMemo(
    () =>
      [...breakpoints].sort(
        (a, b) =>
          maxWidth[a as keyof typeof maxWidth] -
          maxWidth[b as keyof typeof maxWidth]
      ),
    [breakpoints, maxWidth]
  );

  const getActiveBreakpoint = (): T => {
    if (typeof window === "undefined") return sortedBreakpoints[0];
    const screenWidth = window.innerWidth;
    let buffer: T = sortedBreakpoints[0];
    for (const i of sortedBreakpoints) {
      if (
        screenWidth >= maxWidth[i as keyof typeof maxWidth] &&
        maxWidth[i as keyof typeof maxWidth] >
          maxWidth[buffer as keyof typeof maxWidth]
      ) {
        buffer = i;
      }
    }
    return buffer;
  };

  const [mediaQuery, setMediaQuery] = useState<T | null | "base">(() => {
    if (typeof window !== "undefined") {
      return getActiveBreakpoint();
    }
    return null;
  });

  useEffect(() => {
    const handleResize = () => {
      setMediaQuery(getActiveBreakpoint());
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sortedBreakpoints]);

  return mediaQuery;
}
