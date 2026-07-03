import { useEffect, useRef, useState } from 'react';

/** 숫자 카운트업 (easeOutExpo, rAF) */
export default function CountUp({
  value,
  duration = 1400,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return (
    <span className={`num ${className ?? ''}`}>{display.toLocaleString('ko-KR')}</span>
  );
}
