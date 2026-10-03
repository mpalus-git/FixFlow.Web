import { useEffect, useState } from "react";

export function useHorizontalOverflow<TElement extends HTMLElement>() {
  const [element, setElement] = useState<TElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (element === null || typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(() => {
      setIsOverflowing(element.scrollWidth > element.clientWidth);
    });
    observer.observe(element);
    for (const child of element.children) {
      observer.observe(child);
    }
    return () => {
      observer.disconnect();
    };
  }, [element]);

  return { ref: setElement, isOverflowing };
}
