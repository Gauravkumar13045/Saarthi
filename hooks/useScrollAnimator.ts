import { useState, useEffect, useRef } from 'react';

interface ScrollAnimatorOptions {
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
}

export const useScrollAnimator = <T extends HTMLElement>(options?: ScrollAnimatorOptions): [React.RefObject<T>, boolean] => {
  const { threshold = 0.1, triggerOnce = true, rootMargin = '0px' } = options || {};
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [ref, threshold, triggerOnce, rootMargin]);

  return [ref, isVisible];
};
