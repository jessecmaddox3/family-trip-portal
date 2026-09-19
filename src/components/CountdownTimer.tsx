"use client";
import { useState, useEffect } from "react";
export default function CountdownTimer({
  targetInstant,
  demoNow,
}: {
  targetInstant: number;
  demoNow?: number;
}) {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const started = Date.now();
    const update = () => {
      const now =
        demoNow === undefined ? Date.now() : demoNow + Date.now() - started;
      setRemaining(
        Number.isFinite(targetInstant) && Number.isFinite(now)
          ? Math.max(0, targetInstant - now)
          : null,
      );
    };
    const initial = setTimeout(update, 0),
      timer = setInterval(update, 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, [targetInstant, demoNow]);
  const seconds = Math.floor((remaining ?? 0) / 1000);
  const units = [
    { label: "Days", value: Math.floor(seconds / 86400) },
    { label: "Hours", value: Math.floor((seconds % 86400) / 3600) },
    { label: "Min", value: Math.floor((seconds % 3600) / 60) },
    { label: "Sec", value: seconds % 60 },
  ];
  return (
    <div className="animate-fade-in-up-delay-2">
      <p className="text-xs uppercase tracking-widest text-ocean-100 mb-3 font-medium">
        {remaining === 0 ? "Check-in time reached" : "Until check-in"}
        {demoNow !== undefined ? " · example clock" : ""}
      </p>
      <div
        className="inline-flex gap-2 md:gap-3 glass rounded-2xl px-4 py-4 md:px-8 md:py-5"
        aria-label="Time until check-in"
      >
        {units.map(({ label, value }, i) => (
          <div key={label} className="flex items-center gap-2 md:gap-3">
            <div className="text-center">
              <div className="text-3xl md:text-5xl font-heading font-bold text-white tabular-nums leading-none">
                {remaining === null ? "··" : String(value).padStart(2, "0")}
              </div>
              <p className="text-[10px] md:text-xs text-ocean-100 mt-1 uppercase tracking-wide">
                {label}
              </p>
            </div>
            {i < 3 && (
              <span className="text-2xl md:text-4xl text-ocean-300 font-light -mt-4">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
