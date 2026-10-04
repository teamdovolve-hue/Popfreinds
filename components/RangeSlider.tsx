"use client";

interface RangeSliderProps {
  value: number;
  max: number;
  step?: number;
  label: string;
  disabled?: boolean;
  className?: string;
  /** Fires continuously while dragging */
  onChange: (value: number) => void;
  /** Fires once when the user releases the pointer or a key */
  onCommit?: (value: number) => void;
}

export default function RangeSlider({
  value,
  max,
  step = 0.1,
  label,
  disabled,
  className = "",
  onChange,
  onCommit,
}: RangeSliderProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <input
      type="range"
      aria-label={label}
      min={0}
      max={max || 1}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      onPointerUp={(e) => onCommit?.(Number(e.currentTarget.value))}
      onKeyUp={(e) => onCommit?.(Number(e.currentTarget.value))}
      style={{
        background: `linear-gradient(to right, #6366f1 ${pct}%, rgba(255,255,255,0.2) ${pct}%)`,
      }}
      className={`h-1.5 cursor-pointer appearance-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-60
        [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow
        [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white
        ${className}`}
    />
  );
}
