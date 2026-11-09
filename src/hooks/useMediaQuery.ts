import { useEffect, useState } from "react";

/** Telas de celular (abaixo do breakpoint `md` do Tailwind). */
export const NARROW_SCREEN_QUERY = "(max-width: 767px)";

const matches = (query: string) =>
  typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(query).matches;

/** Acompanha uma media query CSS e re-renderiza quando ela muda. */
export const useMediaQuery = (query: string): boolean => {
  const [isMatch, setIsMatch] = useState(() => matches(query));

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mediaQuery = window.matchMedia(query);
    const handleChange = () => setIsMatch(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return isMatch;
};
