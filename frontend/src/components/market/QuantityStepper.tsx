import { Minus, Plus } from "lucide-react";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md";
};

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
  label = "Quantity",
  size = "sm",
}: Props) {
  const button = size === "sm" ? "h-8 w-8" : "h-11 w-11";
  const icon = size === "sm" ? 13 : 16;

  return (
    <div
      className={`inline-flex items-center overflow-hidden rounded-lg border border-ink-200 bg-white ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <button
        type="button"
        aria-label={`Decrease ${label.toLowerCase()}`}
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={`${button} grid place-items-center text-ink-600 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:text-ink-300`}
      >
        <Minus size={icon} strokeWidth={2.2} />
      </button>
      <input
        aria-label={label}
        inputMode="numeric"
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const next = Number(e.target.value.replace(/\D/g, ""));
          onChange(Math.max(min, max ? Math.min(max, next) : next || min));
        }}
        className="w-9 border-x border-ink-200 bg-white text-center text-[13px] font-semibold tabular-nums text-ink-900 outline-none disabled:bg-ink-50"
      />
      <button
        type="button"
        aria-label={`Increase ${label.toLowerCase()}`}
        disabled={disabled || (max !== undefined && value >= max)}
        onClick={() => onChange(value + 1)}
        className={`${button} grid place-items-center text-ink-600 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:text-ink-300`}
      >
        <Plus size={icon} strokeWidth={2.2} />
      </button>
    </div>
  );
}
