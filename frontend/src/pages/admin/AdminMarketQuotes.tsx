import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { useAdminMarketQuotes, useUpdateMarketQuote } from "../../hooks/useMarket";
import type { MarketQuote, MarketQuoteStatus } from "../../types";
import { formatUSD } from "../../utils/format";

const STATUS_OPTIONS: { value: MarketQuoteStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "reviewing", label: "Reviewing" },
  { value: "quoted", label: "Quoted" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "expired", label: "Expired" },
];

const statusBadge = (status: MarketQuoteStatus) => {
  switch (status) {
    case "quoted":
    case "accepted":
      return "badge-green";
    case "declined":
    case "expired":
      return "badge-red";
    case "reviewing":
      return "badge-blue";
    default:
      return "badge-amber";
  }
};

const customerName = (quote: MarketQuote) =>
  typeof quote.user === "string"
    ? quote.contact?.name ?? "Customer"
    : quote.user?.name ?? quote.contact?.name ?? "Customer";

export default function AdminMarketQuotes() {
  const [status, setStatus] = useState("");
  const [active, setActive] = useState<MarketQuote | null>(null);
  const [form, setForm] = useState<{ status: MarketQuoteStatus; quotedAmount: string; adminNotes: string }>({
    status: "pending",
    quotedAmount: "",
    adminNotes: "",
  });

  const { data, isLoading } = useAdminMarketQuotes({ status: status || undefined });
  const updateQuote = useUpdateMarketQuote();

  const quotes = data?.quotes ?? [];
  const pending = quotes.filter((q) => q.status === "pending" || q.status === "reviewing");
  const pipelineValue = quotes.reduce((sum, q) => sum + (q.subtotal || 0), 0);

  const openQuote = (quote: MarketQuote) => {
    setActive(quote);
    setForm({
      status: quote.status,
      quotedAmount: quote.quotedAmount ? String(quote.quotedAmount) : "",
      adminNotes: quote.adminNotes ?? "",
    });
  };

  const save = async () => {
    if (!active) return;
    try {
      await updateQuote.mutateAsync({
        id: active._id,
        status: form.status,
        quotedAmount: form.quotedAmount ? Number(form.quotedAmount) : undefined,
        adminNotes: form.adminNotes || undefined,
      });
      toast.success("Quote updated");
      setActive(null);
    } catch {
      toast.error("Could not update the quote");
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading-md">Market quotes</h1>
          <p className="mt-1 text-[13.5px] text-ink-600">
            Equipment baskets submitted from the shop
          </p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="select h-10 w-auto min-w-[170px] py-0"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Open requests", value: pending.length },
          { label: "All requests", value: quotes.length },
          { label: "Basket value", value: formatUSD(pipelineValue) },
        ].map((tile) => (
          <div key={tile.label} className="stat-card">
            <span className="text-[12.5px] text-ink-500">{tile.label}</span>
            <span className="font-display text-[22px] font-bold tabular-nums text-ink-900">
              {tile.value}
            </span>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr>
              <th className="table-head">Reference</th>
              <th className="table-head">Customer</th>
              <th className="table-head text-right">Lines</th>
              <th className="table-head text-right">Subtotal</th>
              <th className="table-head">Status</th>
              <th className="table-head">Received</th>
              <th className="table-head text-right" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="table-cell text-ink-500" colSpan={7}>
                  Loading quote requests…
                </td>
              </tr>
            )}

            {!isLoading && quotes.length === 0 && (
              <tr>
                <td className="table-cell text-ink-500" colSpan={7}>
                  No quote requests yet. Baskets submitted from the shop appear here.
                </td>
              </tr>
            )}

            {quotes.map((quote) => (
              <tr key={quote._id} className="table-row">
                <td className="table-cell font-mono text-[12.5px] font-semibold text-ink-900">
                  {quote.referenceNumber}
                </td>
                <td className="table-cell">
                  <p className="text-[13.5px] font-medium text-ink-900">
                    {customerName(quote)}
                  </p>
                  <p className="text-[12px] text-ink-500">{quote.contact?.phone ?? "—"}</p>
                </td>
                <td className="table-cell text-right tabular-nums">{quote.items.length}</td>
                <td className="table-cell text-right font-semibold tabular-nums">
                  {formatUSD(quote.subtotal)}
                </td>
                <td className="table-cell">
                  <span className={`badge ${statusBadge(quote.status)}`}>
                    {STATUS_OPTIONS.find((o) => o.value === quote.status)?.label}
                  </span>
                </td>
                <td className="table-cell text-[12.5px] text-ink-500">
                  {new Date(quote.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="table-cell text-right">
                  <button
                    type="button"
                    onClick={() => openQuote(quote)}
                    className="btn btn-secondary btn-sm"
                  >
                    Open <ChevronDown size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {active && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActive(null)}
              className="fixed inset-0 z-50 bg-ink-900/40"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Quote ${active.referenceNumber}`}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-[520px] overflow-y-auto bg-white p-6 shadow-xl"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="heading-sm">{active.referenceNumber}</h2>
                  <p className="mt-1 text-[13px] text-ink-500">
                    {customerName(active)} · {active.contact?.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  aria-label="Close"
                  className="grid h-8 w-8 place-items-center rounded-md text-ink-500 hover:bg-ink-50"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="rounded-xl border border-ink-200">
                {active.items.map((item) => (
                  <div
                    key={item.sku}
                    className="flex items-start justify-between gap-3 border-b border-ink-200 p-3 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-medium text-ink-900">
                        {item.title}
                      </p>
                      <p className="font-mono text-[11.5px] text-ink-400">
                        {item.sku} · {item.qty} × {formatUSD(item.unitPrice)}
                      </p>
                    </div>
                    <span className="text-[13px] font-semibold tabular-nums text-ink-900">
                      {formatUSD(item.lineTotal)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between bg-ink-50 p-3">
                  <span className="text-[13px] text-ink-600">Estimated goods subtotal</span>
                  <span className="text-[15px] font-bold tabular-nums text-ink-900">
                    {formatUSD(active.subtotal)}
                  </span>
                </div>
              </div>

              {active.deliveryCity || active.notes ? (
                <div className="mt-3 space-y-1 text-[13px] text-ink-600">
                  {active.deliveryCity && <p>Deliver to: {active.deliveryCity}</p>}
                  {active.notes && <p>Notes: {active.notes}</p>}
                </div>
              ) : null}

              <div className="mt-5 space-y-3">
                <div>
                  <label htmlFor="q-status" className="label">
                    Status
                  </label>
                  <select
                    id="q-status"
                    className="select"
                    value={form.status}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, status: e.target.value as MarketQuoteStatus }))
                    }
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="q-amount" className="label">
                    Quoted amount (USD)
                  </label>
                  <input
                    id="q-amount"
                    type="number"
                    min={0}
                    step="0.01"
                    className="input tabular-nums"
                    value={form.quotedAmount}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, quotedAmount: e.target.value }))
                    }
                    placeholder={String(active.subtotal)}
                  />
                  <p className="field-hint">
                    Include delivery and installation before quoting.
                  </p>
                </div>

                <div>
                  <label htmlFor="q-notes" className="label">
                    Internal note
                  </label>
                  <textarea
                    id="q-notes"
                    className="textarea"
                    rows={3}
                    value={form.adminNotes}
                    onChange={(e) => setForm((prev) => ({ ...prev, adminNotes: e.target.value }))}
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={save}
                    disabled={updateQuote.isPending}
                    className="btn btn-primary btn-md flex-1"
                  >
                    {updateQuote.isPending ? "Saving…" : "Save quote"}
                  </button>
                  {active.conversationId && (
                    <a href="/admin/chat" className="btn btn-secondary btn-md">
                      Open chat
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
