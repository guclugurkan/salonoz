import { useEffect, useRef, useState } from "react";

export default function useScrollReveal(threshold = 0.2) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold }
    );

    observer.observe(element);

    // Fix : si l'élément est déjà dans le viewport au chargement, on déclenche immédiatement
    const rect = element.getBoundingClientRect();
    const alreadyVisible =
      rect.top < window.innerHeight && rect.bottom > 0;

    if (alreadyVisible) {
      setIsVisible(true);
      observer.unobserve(element);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}