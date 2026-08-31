import { useEffect, useState } from "preact/hooks";

const BREAKPOINT = 460;

const getIsCompact = () =>
  typeof window !== "undefined" && window.innerWidth <= BREAKPOINT;

export function useCompactLayout(): boolean {
  const [isCompact, setIsCompact] = useState(getIsCompact);

  useEffect(() => {
    const onResize = () => setIsCompact(getIsCompact());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return isCompact;
}
