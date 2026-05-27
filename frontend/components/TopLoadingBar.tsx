"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * NProgress-style loading bar that activates on route changes.
 * Pure CSS — no external dependency required.
 */
export function TopLoadingBar() {
  const pathname = usePathname();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Start the bar on every pathname change
    setVisible(true);
    setWidth(0);

    // Animate quickly to 80% then hold
    const t1 = setTimeout(() => setWidth(30), 50);
    const t2 = setTimeout(() => setWidth(60), 200);
    const t3 = setTimeout(() => setWidth(80), 500);

    // Complete after a short hold
    const t4 = setTimeout(() => {
      setWidth(100);
      // Hide after the fill completes
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 300);
    }, 700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-[3px] transition-all duration-300 ease-out"
      style={{
        width: `${width}%`,
        background: "linear-gradient(to right, #6366f1, #818cf8, #a5b4fc)",
        boxShadow: "0 0 10px rgba(99,102,241,0.7), 0 0 5px rgba(99,102,241,0.4)",
      }}
    />
  );
}
