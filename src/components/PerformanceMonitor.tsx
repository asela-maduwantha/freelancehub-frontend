"use client";
import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor FCP (First Contentful Paint)
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`Performance metric: ${entry.name}`, entry);
        }
      });

      observer.observe({ entryTypes: ['paint', 'navigation', 'largest-contentful-paint'] });

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  // This component doesn't render anything visible
  return null;
}
