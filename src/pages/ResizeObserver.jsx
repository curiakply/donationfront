import React, { useRef, useEffect } from 'react';
import { ResizeObserver } from '@juggle/resize-observer'; // Use polyfill

const ResizeObserverWrapper = ({ children }) => {
  const observerRef = useRef();

  useEffect(() => {
    let resizeTimeout;
    const resizeObserver = new ResizeObserver((entries) => {
      clearTimeout(resizeTimeout); // Debounce logic
      resizeTimeout = setTimeout(() => {
        entries.forEach((entry) => {
          console.log('Resized:', entry.target, entry.contentRect);
        });
      }, 100); // Debounce time in ms
    });

    if (observerRef.current) {
      resizeObserver.observe(observerRef.current);
    }

    return () => {
      clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
    };
  }, []);

  return <div ref={observerRef}>{children}</div>;
};

export default ResizeObserverWrapper;
