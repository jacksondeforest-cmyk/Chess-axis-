
import { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
}

export default function AnimatedNumber({ value, className, suffix = '', prefix = '', decimals = 0, duration = 1.2 }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.4, 0, 0.2, 1],
      onUpdate: (v) => {
        const formatted = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString();
        el.textContent = `${prefix}${formatted}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [value, decimals, prefix, suffix, duration]);

  const display = decimals > 0 ? value.toFixed(decimals) : value.toLocaleString();

  return <span ref={ref} className={cn(className)}>{prefix}{display}{suffix}</span>;
}
