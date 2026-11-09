import { Link } from "@tanstack/react-router";
import { ShoppingBasket } from "lucide-react";

import { basketUnitCount, useBasketStore } from "../../stores/basket.store";

type Props = {
  /** Compact variant sits in the mobile bar. */
  compact?: boolean;
};

export default function BasketLink({ compact = false }: Props) {
  const lines = useBasketStore((s) => s.lines);
  const count = basketUnitCount(lines);

  return (
    <Link
      to="/market/quote"
      className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-lg px-2.5 text-[13.5px] font-medium text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
      aria-label={`Quote basket, ${count} item${count === 1 ? "" : "s"}`}
    >
      <ShoppingBasket size={17} strokeWidth={1.8} />
      {!compact && <span>Quote basket</span>}
      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-1.5 text-[11.5px] font-bold leading-none text-sky-700">
        {count}
      </span>
    </Link>
  );
}
