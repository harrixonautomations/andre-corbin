import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: string;
  targetTime?: string;
}

const CountdownTimer = ({ targetDate, targetTime }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const target = new Date(`${targetDate}T${targetTime || "00:00:00"}`);

    const tick = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setExpired(true);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  if (expired) {
    return <span className="text-xs text-primary font-medium">Session time reached</span>;
  }

  const blocks = [
    { label: "Days", value: timeLeft.days },
    { label: "Hrs", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      {blocks.map((b) => (
        <div key={b.label} className="flex flex-col items-center bg-secondary rounded px-1.5 sm:px-2 py-1 min-w-[32px] sm:min-w-[38px]">
          <span className="text-foreground font-semibold text-xs sm:text-sm tabular-nums">{String(b.value).padStart(2, "0")}</span>
          <span className="text-muted-foreground text-[8px] sm:text-[9px] uppercase tracking-wider">{b.label}</span>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
