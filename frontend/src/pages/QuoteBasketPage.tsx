import { Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import QuantityStepper from "../components/market/QuantityStepper";
import { useCreateMarketQuote } from "../hooks/useMarket";
import { basketSubtotal, basketUnitCount, useBasketStore } from "../stores/basket.store";
import { useAuthStore } from "../stores/auth.store";
import { formatUSD } from "../utils/format";

export default function QuoteBasketPage() {
  const lines = useBasketStore((s) => s.lines);
  const setQty = useBasketStore((s) => s.setQty);
  const remove = useBasketStore((s) => s.remove);
  const clear = useBasketStore((s) => s.clear);

  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const createQuote = useCreateMarketQuote();

  const [deliveryCity, setDeliveryCity] = useState("Harare");
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [confirmed, setConfirmed] = useState<{ reference: string; subtotal: number } | null>(
    null,
  );

  const subtotal = basketSubtotal(lines);
  const units = basketUnitCount(lines);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate({ to: "/login", search: { redirect: "/market/quote" } as never });
      return;
    }
    if (!lines.length) return;

    try {
      const result = await createQuote.mutateAsync({
        items: lines.map((line) => ({ product: line.productId, qty: line.qty })),
        deliveryCity: deliveryCity || undefined,
        notes: notes || undefined,
        contact: {
          name: user?.name,
          email: user?.email,
          phone: phone || undefined,
        },
      });

      setConfirmed({ reference: result.quote.referenceNumber, subtotal: result.quote.subtotal });
      clear();
      toast.success("Quote request submitted");
    } catch {
      toast.error("Could not submit the quote request. Please try again.");
    }
  };

  if (confirmed) {
    return (
      <div className="container-md py-16 text-center">
        <CheckCircle2 size={40} className="mx-auto text-sky-600" strokeWidth={1.6} />
        <h1 className="heading-md mt-4">Quote request {confirmed.reference} sent</h1>
        <p className="mt-2 text-[14.5px] text-ink-600">
          Our sales desk has the basket of {formatUSD(confirmed.subtotal)}. Staff will confirm
          price, delivery and availability in your dashboard chat.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/dashboard" className="btn btn-primary btn-lg">
            Open my dashboard
          </Link>
          <Link to="/market" className="btn btn-secondary btn-lg">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="container-md py-16 text-center">
        <h1 className="heading-md">Your quote basket is empty</h1>
        <p className="mt-2 text-[14.5px] text-ink-600">
          Add equipment from the shop and we will price the basket with delivery for your
          site.
        </p>
        <Link to="/market" className="btn btn-primary btn-lg mt-6">
          Browse equipment
        </Link>
      </div>
    );
  }

  return (
    <div className="container-xl py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading-lg">Quote basket</h1>
          <p className="mt-1 text-[13.5px] text-ink-600">
            {lines.length} line{lines.length === 1 ? "" : "s"} · {units} unit
            {units === 1 ? "" : "s"} · no online payment
          </p>
        </div>
        <Link to="/market" className="textlink">
          Continue shopping
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Lines */}
        <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
          <div className="hidden grid-cols-[minmax(0,1fr)_120px_120px_110px_36px] gap-3 border-b border-ink-200 bg-ink-50 px-4 py-2.5 text-[12px] font-semibold text-ink-500 sm:grid">
            <span>Product</span>
            <span>Quantity</span>
            <span className="text-right">Unit price</span>
            <span className="text-right">Line total</span>
            <span />
          </div>

          {lines.map((line) => (
            <div
              key={line.productId}
              className="grid grid-cols-1 gap-3 border-b border-ink-200 p-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_120px_120px_110px_36px] sm:items-center"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-ink-200 bg-ink-50">
                  {line.image ? (
                    <img
                      src={line.image}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <Link
                    to="/market/$slug"
                    params={{ slug: line.slug }}
                    className="block truncate text-[14px] font-semibold text-ink-900 hover:text-sky-700"
                  >
                    {line.title}
                  </Link>
                  <p className="font-mono text-[11.5px] text-ink-400">
                    {line.sku} · {line.unit}
                  </p>
                </div>
              </div>

              <div>
                <QuantityStepper
                  value={line.qty}
                  onChange={(qty) => setQty(line.productId, qty)}
                  max={99}
                  label={`Quantity of ${line.title}`}
                />
              </div>

              <p className="text-[13px] text-ink-600 sm:text-right">
                <span className="tabular-nums">{formatUSD(line.unitPrice)}</span>
              </p>

              <p className="text-[13.5px] font-semibold tabular-nums text-ink-900 sm:text-right">
                {formatUSD(line.unitPrice * line.qty)}
              </p>

              <button
                type="button"
                onClick={() => remove(line.productId)}
                aria-label={`Remove ${line.title}`}
                className="justify-self-start rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-red-600 sm:justify-self-center"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <form onSubmit={submit} className="h-fit rounded-xl border border-ink-200 bg-sky-50 p-5">
          <div className="flex items-baseline justify-between border-b border-sky-200 pb-3">
            <span className="text-[13px] text-ink-600">Estimated goods subtotal</span>
            <span className="font-display text-[22px] font-bold tabular-nums text-ink-900">
              {formatUSD(subtotal)}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="delivery-city" className="label">
                Delivery city
              </label>
              <select
                id="delivery-city"
                className="select"
                value={deliveryCity}
                onChange={(e) => setDeliveryCity(e.target.value)}
              >
                {["Harare", "Bulawayo", "Mutare", "Gweru", "Other"].map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="basket-phone" className="label">
                Contact number
              </label>
              <input
                id="basket-phone"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+263 …"
                autoComplete="tel"
              />
            </div>

            <div>
              <label htmlFor="basket-notes" className="label">
                Notes for the sales desk
              </label>
              <textarea
                id="basket-notes"
                className="textarea"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Site address, required date, existing pump model…"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={createQuote.isPending}
            className="btn btn-primary btn-lg mt-4 w-full"
          >
            {createQuote.isPending ? "Submitting…" : "Submit quote request"}
          </button>

          <p className="mt-2 text-[12px] leading-relaxed text-ink-500">
            Delivery, installation and final price are confirmed by staff in the quotation.
            No online payment is taken.
          </p>

          {!isAuthenticated && (
            <p className="mt-3 rounded-lg border border-sky-200 bg-white p-2.5 text-[12.5px] text-ink-600">
              You will be asked to sign in before the request is sent.{" "}
              <Link
                to="/login"
                search={{ redirect: "/market/quote" } as never}
                className="font-semibold text-sky-700"
              >
                Sign in
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
