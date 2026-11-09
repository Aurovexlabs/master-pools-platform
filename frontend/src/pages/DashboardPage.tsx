import { Link } from "@tanstack/react-router";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  Eye,
  FileText,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useConversations, useMyQuotations } from "../hooks/useApi";
import { useMyMarketQuotes } from "../hooks/useMarket";
import { formatUSD } from "../utils/format";
import { useAuthStore } from "../stores/auth.store";
import { useUIStore } from "../stores/ui.store";
import type { Conversation } from "../types";
import { cn } from "../utils/cn";

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeCls: string; icon: any; iconColor: string }
> = {
  pending: {
    label: "Pending Review",
    badgeCls: "badge badge-gray",
    icon: Clock,
    iconColor: "var(--color-gray-400)",
  },
  reviewing: {
    label: "Under Review",
    badgeCls: "badge badge-blue",
    icon: Eye,
    iconColor: "var(--color-primary-600)",
  },
  quoted: {
    label: "Quote Ready",
    badgeCls: "badge badge-amber",
    icon: DollarSign,
    iconColor: "var(--color-amber-500)",
  },
  accepted: {
    label: "Accepted",
    badgeCls: "badge badge-green",
    icon: CheckCircle,
    iconColor: "var(--color-accent-500)",
  },
  rejected: {
    label: "Not Proceeded",
    badgeCls: "badge badge-red",
    icon: AlertCircle,
    iconColor: "var(--color-danger)",
  },
  expired: {
    label: "Expired",
    badgeCls: "badge badge-gray",
    icon: Clock,
    iconColor: "var(--color-gray-300)",
  },
};

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] as any },
});

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { setChatOpen, setActiveConversation } = useUIStore();
  const [activeTab, setActiveTab] = useState<
    "overview" | "quotations" | "equipment" | "messages"
  >("overview");

  const {
    data: quotations = [],
    isLoading: qLoading,
    refetch: refetchQ,
  } = useMyQuotations();
  const { data: convData, isLoading: cLoading } = useConversations();
  const conversations: Conversation[] = (convData as any) || [];
  const { data: marketQuotes = [] } = useMyMarketQuotes();

  const openConversation = (id: string) => {
    setActiveConversation(id);
    setChatOpen(true);
  };

  const stats = useMemo(
    () => ({
      total: quotations.length,
      pending: quotations.filter((q) => q.status === "pending").length,
      quoted: quotations.filter((q) => q.status === "quoted").length,
      accepted: quotations.filter((q) => q.status === "accepted").length,
      totalValue: quotations
        .filter((q) => q.quotedAmount?.amount)
        .reduce((s, q) => s + (q.quotedAmount?.amount ?? 0), 0),
      unreadMessages: conversations.reduce(
        (s, c) => s + (c.unreadByUser || 0),
        0,
      ),
      openChats: conversations.filter((c) => c.status === "open").length,
    }),
    [quotations, conversations],
  );

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const KPI_CARDS = [
    {
      label: "Total Requests",
      value: stats.total,
      icon: FileText,
      sub: "All quotations",
      color: "blue",
    },
    {
      label: "Awaiting Quote",
      value: stats.pending,
      icon: Clock,
      sub: "Under review",
      color: "amber",
    },
    {
      label: "Quotes Received",
      value: stats.quoted,
      icon: DollarSign,
      sub: "Ready to review",
      color: "green",
    },
    {
      label: "Unread Messages",
      value: stats.unreadMessages,
      icon: MessageCircle,
      sub: `${stats.openChats} open chats`,
      color: "indigo",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        paddingTop: "5rem",
        paddingBottom: "5rem",
        background: "var(--color-bg)",
      }}
    >
      <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "0 1.5rem" }}>
        {/* ── Header ────────────────────────────────────────────────── */}
        <motion.div
          {...fadeIn(0)}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-text-secondary)",
                  marginBottom: "0.25rem",
                }}
              >
                {greeting},
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 800,
                  fontSize: "1.875rem",
                  color: "var(--color-text)",
                  letterSpacing: "-0.025em",
                  margin: 0,
                }}
              >
                {user?.name?.split(" ")[0]}'s{" "}
                <span
                  style={{
                    background:
                      "var(--color-sky-600)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Dashboard
                </span>
              </h1>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-text-tertiary)",
                  marginTop: "0.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span className="status-online" />
                MATERPOOLS AND CONTRUCTION Platform · {format(new Date(), "EEEE, d MMMM yyyy")}
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                onClick={() => refetchQ()}
                className="btn btn-secondary btn-md"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <RefreshCw style={{ width: "0.875rem", height: "0.875rem" }} />{" "}
                Refresh
              </button>
              <Link
                to="/quotation"
                className="btn btn-primary btn-md"
                style={{
                  display: "inline-flex",
                  gap: "0.5rem",
                  textDecoration: "none",
                }}
              >
                <Plus style={{ width: "1rem", height: "1rem" }} /> New Quotation
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── KPI Cards ─────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
          className="lg:grid-cols-4"
        >
          {KPI_CARDS.map(({ label, value, icon: Icon, sub, color }, i) => (
            <motion.div key={label} {...fadeIn(i * 0.06)} className="stat-card">
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      color === "blue"
                        ? "var(--color-primary-50)"
                        : color === "amber"
                          ? "rgba(245,158,11,0.1)"
                          : color === "green"
                            ? "var(--color-accent-50)"
                            : "var(--color-secondary-50)",
                    border: `1px solid ${
                      color === "blue"
                        ? "var(--color-primary-100)"
                        : color === "amber"
                          ? "rgba(245,158,11,0.2)"
                          : color === "green"
                            ? "var(--color-accent-100)"
                            : "var(--color-secondary-100)"
                    }`,
                  }}
                >
                  <Icon
                    style={{
                      width: "1.125rem",
                      height: "1.125rem",
                      color:
                        color === "blue"
                          ? "var(--color-primary-700)"
                          : color === "amber"
                            ? "var(--color-amber-600)"
                            : color === "green"
                              ? "var(--color-accent-600)"
                              : "var(--color-secondary-600)",
                    }}
                  />
                </div>
                <TrendingUp
                  style={{
                    width: "0.875rem",
                    height: "0.875rem",
                    color: "var(--color-gray-300)",
                  }}
                />
              </div>
              <div style={{ marginTop: "1rem" }}>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 800,
                    fontSize: "1.875rem",
                    color: "var(--color-text)",
                    letterSpacing: "-0.03em",
                    margin: 0,
                  }}
                >
                  {value}
                </p>
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    marginTop: "0.25rem",
                    margin: "0.25rem 0 0",
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-tertiary)",
                    margin: 0,
                  }}
                >
                  {sub}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Quote value banner ─────────────────────────────────────── */}
        {stats.totalValue > 0 && (
          <motion.div
            {...fadeIn(0.25)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "1.125rem 1.25rem",
              background:
                "var(--color-sky-50)",
              border: "1px solid var(--color-primary-100)",
              borderRadius: "14px",
              boxShadow: "0 1px 3px rgba(30,58,138,0.06)",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: "2.75rem",
                height: "2.75rem",
                borderRadius: "10px",
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <DollarSign
                style={{
                  width: "1.25rem",
                  height: "1.25rem",
                  color: "var(--color-amber-600)",
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: "var(--color-text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "0.125rem",
                }}
              >
                Total Quoted Value
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  color: "var(--color-text)",
                  letterSpacing: "-0.025em",
                  margin: 0,
                }}
              >
                ${stats.totalValue.toLocaleString()}{" "}
                <span
                  style={{
                    color: "var(--color-text-tertiary)",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  USD
                </span>
              </p>
            </div>
            <Link
              to="/quotation"
              className="btn btn-primary btn-sm"
              style={{
                display: "inline-flex",
                gap: "0.375rem",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              Add Project{" "}
              <ArrowRight style={{ width: "0.875rem", height: "0.875rem" }} />
            </Link>
          </motion.div>
        )}

        {/* ── Tab Navigation ─────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: "0.25rem",
            padding: "0.25rem",
            background: "#fff",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            marginBottom: "1.5rem",
            width: "fit-content",
          }}
        >
          {(["overview", "quotations", "equipment", "messages"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.4375rem 1rem",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
                textTransform: "capitalize",
                background:
                  activeTab === tab
                    ? "var(--color-primary-900)"
                    : "transparent",
                color: activeTab === tab ? "#fff" : "var(--color-gray-500)",
              }}
            >
              {tab === "equipment" ? "Equipment quotes" : tab}
              {tab === "messages" && stats.unreadMessages > 0 && (
                <span
                  style={{
                    marginLeft: "0.375rem",
                    display: "inline-flex",
                    width: "1.125rem",
                    height: "1.125rem",
                    borderRadius: "50%",
                    background: "#EF4444",
                    color: "#fff",
                    fontSize: "0.5625rem",
                    fontWeight: 700,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {stats.unreadMessages}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB: OVERVIEW ─────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "1.5rem",
            }}
            className="lg:grid-cols-3"
          >
            {/* Main content (2 cols) */}
            <motion.div
              {...fadeIn(0)}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
              className="lg:col-span-2"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.25rem",
                }}
              >
                <h2
                  style={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "var(--color-text)",
                    margin: 0,
                  }}
                >
                  Recent Activity
                </h2>
                <button
                  onClick={() => setActiveTab("quotations")}
                  style={{
                    color: "var(--color-primary-700)",
                    fontSize: "0.8125rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  View all{" "}
                  <ChevronRight
                    style={{ width: "0.875rem", height: "0.875rem" }}
                  />
                </button>
              </div>

              {qLoading ? (
                Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={i}
                    className="skeleton"
                    style={{ height: "5rem" }}
                  />
                ))
              ) : !quotations.length ? (
                <div
                  className="card"
                  style={{ padding: "3.5rem", textAlign: "center" }}
                >
                  <div
                    style={{
                      width: "3.5rem",
                      height: "3.5rem",
                      borderRadius: "12px",
                      background: "var(--color-primary-50)",
                      border: "1px solid var(--color-primary-100)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1rem",
                    }}
                  >
                    <FileText
                      style={{
                        width: "1.75rem",
                        height: "1.75rem",
                        color: "var(--color-primary-400)",
                      }}
                    />
                  </div>
                  <h3
                    style={{
                      fontWeight: 700,
                      color: "var(--color-text)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    No quotations yet
                  </h3>
                  <p
                    style={{
                      color: "var(--color-text-secondary)",
                      fontSize: "0.875rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    Describe your dream pool and we'll send you a detailed
                    quote.
                  </p>
                  <Link
                    to="/quotation"
                    className="btn btn-primary btn-sm"
                    style={{
                      display: "inline-flex",
                      gap: "0.5rem",
                      textDecoration: "none",
                    }}
                  >
                    <Plus style={{ width: "0.875rem", height: "0.875rem" }} />{" "}
                    Request Your First Quote
                  </Link>
                </div>
              ) : (
                quotations.slice(0, 5).map((q, idx) => {
                  const cfg = STATUS_CONFIG[q.status];
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={q._id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="card"
                      style={{ padding: "1.125rem 1.25rem" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "1rem",
                        }}
                      >
                        <div
                          style={{
                            width: "2.5rem",
                            height: "2.5rem",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            background:
                              q.status === "reviewing"
                                ? "var(--color-primary-50)"
                                : q.status === "quoted"
                                  ? "rgba(245,158,11,0.08)"
                                  : q.status === "accepted"
                                    ? "var(--color-accent-50)"
                                    : q.status === "rejected"
                                      ? "rgba(239,68,68,0.08)"
                                      : "var(--color-gray-50)",
                            border: `1px solid ${
                              q.status === "reviewing"
                                ? "var(--color-primary-100)"
                                : q.status === "quoted"
                                  ? "rgba(245,158,11,0.2)"
                                  : q.status === "accepted"
                                    ? "var(--color-accent-100)"
                                    : q.status === "rejected"
                                      ? "rgba(239,68,68,0.2)"
                                      : "var(--color-border)"
                            }`,
                          }}
                        >
                          <Icon
                            style={{
                              width: "1.125rem",
                              height: "1.125rem",
                              color: cfg.iconColor,
                            }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              marginBottom: "0.25rem",
                              flexWrap: "wrap",
                            }}
                          >
                            <span className={cfg.badgeCls}>{cfg.label}</span>
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.6875rem",
                                color: "var(--color-gray-400)",
                              }}
                            >
                              #{q.referenceNumber}
                            </span>
                          </div>
                          <p
                            style={{
                              fontWeight: 600,
                              color: "var(--color-text)",
                              fontSize: "0.9rem",
                              textTransform: "capitalize",
                              margin: "0 0 0.25rem",
                            }}
                          >
                            {q.poolType} Pool — {q.poolShape} shape
                          </p>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "1rem",
                              fontSize: "0.75rem",
                              color: "var(--color-text-tertiary)",
                            }}
                          >
                            {q.location?.city && (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                }}
                              >
                                <MapPin
                                  style={{ width: "0.7rem", height: "0.7rem" }}
                                />{" "}
                                {q.location.city}
                              </span>
                            )}
                            <span>
                              {format(new Date(q.createdAt), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: "0.5rem",
                            flexShrink: 0,
                          }}
                        >
                          {q.quotedAmount?.amount && (
                            <div style={{ textAlign: "right" }}>
                              <p
                                style={{
                                  fontSize: "0.625rem",
                                  color: "var(--color-text-tertiary)",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.06em",
                                  marginBottom: "0.125rem",
                                }}
                              >
                                Quoted
                              </p>
                              <p
                                style={{
                                  color: "var(--color-primary-900)",
                                  fontWeight: 700,
                                  fontSize: "1rem",
                                  margin: 0,
                                }}
                              >
                                ${q.quotedAmount.amount.toLocaleString()}
                              </p>
                            </div>
                          )}
                          {q.conversationId && (
                            <button
                              onClick={() =>
                                openConversation(
                                  typeof q.conversationId === "string"
                                    ? q.conversationId
                                    : (q.conversationId as any)._id,
                                )
                              }
                              className="btn btn-outline btn-sm"
                              style={{
                                display: "inline-flex",
                                gap: "0.375rem",
                              }}
                            >
                              <MessageCircle
                                style={{ width: "0.75rem", height: "0.75rem" }}
                              />{" "}
                              Chat
                            </button>
                          )}
                        </div>
                      </div>

                      {q.quotedAmount?.breakdown &&
                        q.quotedAmount.breakdown.length > 0 && (
                          <div
                            style={{
                              marginTop: "0.875rem",
                              paddingTop: "0.875rem",
                              borderTop: "1px solid var(--color-border)",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "0.6875rem",
                                color: "var(--color-text-tertiary)",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                marginBottom: "0.5rem",
                              }}
                            >
                              Cost Breakdown
                            </p>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.375rem",
                              }}
                            >
                              {q.quotedAmount.breakdown
                                .slice(0, 3)
                                .map((b, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      fontSize: "0.8125rem",
                                    }}
                                  >
                                    <span
                                      style={{
                                        color: "var(--color-text-secondary)",
                                      }}
                                    >
                                      {b.item}
                                    </span>
                                    <span
                                      style={{
                                        color: "var(--color-text)",
                                        fontWeight: 500,
                                      }}
                                    >
                                      ${b.cost.toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              {q.quotedAmount.breakdown.length > 3 && (
                                <p
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "var(--color-primary-600)",
                                  }}
                                >
                                  +{q.quotedAmount.breakdown.length - 3} more
                                  items
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                    </motion.div>
                  );
                })
              )}
            </motion.div>

            {/* Sidebar */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {/* Quick actions */}
              <motion.div
                {...fadeIn(0.1)}
                className="card"
                style={{ padding: "1.25rem" }}
              >
                <h3
                  style={{
                    fontWeight: 700,
                    color: "var(--color-text)",
                    fontSize: "0.875rem",
                    marginBottom: "0.875rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Zap
                    style={{
                      width: "0.875rem",
                      height: "0.875rem",
                      color: "var(--color-secondary-500)",
                    }}
                  />{" "}
                  Quick Actions
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                  }}
                >
                  {[
                    {
                      to: "/quotation",
                      icon: Plus,
                      label: "New Quote Request",
                      sub: "Describe your pool",
                    },
                    {
                      to: "/projects",
                      icon: Eye,
                      label: "Browse Projects",
                      sub: "Get inspired",
                    },
                    {
                      to: "/contact",
                      icon: Phone,
                      label: "Contact Team",
                      sub: "Direct support",
                    },
                  ].map(({ to, icon: Icon, label, sub }) => (
                    <Link
                      key={to}
                      to={to}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.625rem 0.75rem",
                        borderRadius: "10px",
                        textDecoration: "none",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "var(--color-gray-50)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <div
                        style={{
                          width: "2.25rem",
                          height: "2.25rem",
                          borderRadius: "8px",
                          background: "var(--color-primary-50)",
                          border: "1px solid var(--color-primary-100)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon
                          style={{
                            width: "0.875rem",
                            height: "0.875rem",
                            color: "var(--color-primary-700)",
                          }}
                        />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p
                          style={{
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            color: "var(--color-text)",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {label}
                        </p>
                        <p
                          style={{
                            fontSize: "0.6875rem",
                            color: "var(--color-text-tertiary)",
                            margin: 0,
                          }}
                        >
                          {sub}
                        </p>
                      </div>
                      <ArrowRight
                        style={{
                          width: "0.875rem",
                          height: "0.875rem",
                          color: "var(--color-gray-300)",
                          flexShrink: 0,
                        }}
                      />
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* Messages */}
              <motion.div
                {...fadeIn(0.15)}
                className="card"
                style={{ padding: "1.25rem" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.875rem",
                  }}
                >
                  <h3
                    style={{
                      fontWeight: 700,
                      color: "var(--color-text)",
                      fontSize: "0.875rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      margin: 0,
                    }}
                  >
                    <MessageCircle
                      style={{
                        width: "0.875rem",
                        height: "0.875rem",
                        color: "var(--color-secondary-500)",
                      }}
                    />{" "}
                    Messages
                  </h3>
                  <button
                    onClick={() => setChatOpen(true)}
                    style={{
                      color: "var(--color-primary-700)",
                      fontSize: "0.75rem",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Open Chat
                  </button>
                </div>
                {!conversations.length ? (
                  <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                    <p
                      style={{
                        color: "var(--color-text-tertiary)",
                        fontSize: "0.875rem",
                      }}
                    >
                      No messages yet.
                    </p>
                    <p
                      style={{
                        color: "var(--color-gray-300)",
                        fontSize: "0.75rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      Submit a quote to start chatting.
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                    }}
                  >
                    {conversations.slice(0, 4).map((conv: any) => (
                      <button
                        key={conv._id}
                        onClick={() => openConversation(conv._id)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.5rem 0.625rem",
                          borderRadius: "8px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "var(--color-gray-50)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <div
                          style={{
                            width: "2rem",
                            height: "2rem",
                            borderRadius: "6px",
                            background: "var(--color-primary-900)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: "0.625rem",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          MP
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: "var(--color-text)",
                              margin: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {conv.subject}
                          </p>
                          <p
                            style={{
                              fontSize: "0.6875rem",
                              color: "var(--color-text-tertiary)",
                              margin: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {conv.lastMessage || "No messages yet"}
                          </p>
                        </div>
                        {conv.unreadByUser > 0 && (
                          <span
                            style={{
                              width: "1.125rem",
                              height: "1.125rem",
                              borderRadius: "50%",
                              background: "#EF4444",
                              color: "#fff",
                              fontSize: "0.5625rem",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {conv.unreadByUser}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Info card */}
              <motion.div
                {...fadeIn(0.2)}
                className="card-featured"
                style={{ padding: "1.25rem" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <Star
                    style={{
                      width: "0.875rem",
                      height: "0.875rem",
                      color: "var(--color-amber-500)",
                    }}
                  />
                  <h3
                    style={{
                      fontWeight: 700,
                      color: "var(--color-text)",
                      fontSize: "0.875rem",
                      margin: 0,
                    }}
                  >
                    Pool Care Tip
                  </h3>
                </div>
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.8125rem",
                    lineHeight: 1.65,
                    marginBottom: "0.75rem",
                  }}
                >
                  Test your pool water at least twice a week during summer.
                  Ideal pH is 7.2–7.6. This extends the life of your filtration
                  system by up to 3 years.
                </p>
                <Link
                  to="/contact"
                  style={{
                    color: "var(--color-primary-700)",
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Ask our experts{" "}
                  <ArrowRight style={{ width: "0.75rem", height: "0.75rem" }} />
                </Link>
              </motion.div>
            </div>
          </div>
        )}

        {/* ── TAB: QUOTATIONS ───────────────────────────────────────── */}
        {activeTab === "quotations" && (
          <motion.div {...fadeIn(0)}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.25rem",
              }}
            >
              <h2
                style={{
                  fontWeight: 700,
                  color: "var(--color-text)",
                  fontSize: "1rem",
                  margin: 0,
                }}
              >
                All Quotation Requests
              </h2>
              <Link
                to="/quotation"
                className="btn btn-primary btn-sm"
                style={{
                  display: "inline-flex",
                  gap: "0.5rem",
                  textDecoration: "none",
                }}
              >
                <Plus style={{ width: "0.875rem", height: "0.875rem" }} /> New
                Request
              </Link>
            </div>

            {!quotations.length ? (
              <div
                className="card"
                style={{ padding: "5rem", textAlign: "center" }}
              >
                <FileText
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    color: "var(--color-primary-400)",
                    margin: "0 auto 1rem",
                  }}
                />
                <h3
                  style={{
                    fontWeight: 700,
                    color: "var(--color-text)",
                    marginBottom: "0.5rem",
                  }}
                >
                  No quotations yet
                </h3>
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.875rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  Start by describing your dream pool.
                </p>
                <Link
                  to="/quotation"
                  className="btn btn-primary btn-sm"
                  style={{ display: "inline-flex", textDecoration: "none" }}
                >
                  Request First Quote
                </Link>
              </div>
            ) : (
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead
                      style={{
                        background: "var(--color-gray-50)",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      <tr>
                        {[
                          "Reference",
                          "Pool Details",
                          "Location",
                          "Status",
                          "Quoted Price",
                          "Date",
                          "Actions",
                        ].map((h) => (
                          <th key={h} className="table-head">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {quotations.map((q) => {
                        const cfg = STATUS_CONFIG[q.status];
                        return (
                          <tr key={q._id} className="table-row">
                            <td
                              className="table-cell"
                              style={{
                                fontFamily: "var(--font-mono)",
                                color: "var(--color-text-tertiary)",
                                fontSize: "0.75rem",
                              }}
                            >
                              #{q.referenceNumber}
                            </td>
                            <td className="table-cell">
                              <p
                                style={{
                                  fontWeight: 600,
                                  color: "var(--color-text)",
                                  textTransform: "capitalize",
                                  fontSize: "0.875rem",
                                  margin: 0,
                                }}
                              >
                                {q.poolType} Pool
                              </p>
                              <p
                                style={{
                                  color: "var(--color-text-tertiary)",
                                  fontSize: "0.75rem",
                                  textTransform: "capitalize",
                                  margin: 0,
                                }}
                              >
                                {q.poolShape} shape
                              </p>
                            </td>
                            <td
                              className="table-cell"
                              style={{
                                color: "var(--color-text-secondary)",
                                fontSize: "0.875rem",
                              }}
                            >
                              {q.location?.city || "—"}
                            </td>
                            <td className="table-cell">
                              <span className={cfg.badgeCls}>{cfg.label}</span>
                            </td>
                            <td className="table-cell">
                              {q.quotedAmount?.amount ? (
                                <span
                                  style={{
                                    color: "var(--color-primary-900)",
                                    fontWeight: 700,
                                  }}
                                >
                                  ${q.quotedAmount.amount.toLocaleString()}
                                </span>
                              ) : (
                                <span
                                  style={{
                                    color: "var(--color-gray-300)",
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  —
                                </span>
                              )}
                            </td>
                            <td
                              className="table-cell"
                              style={{
                                color: "var(--color-text-tertiary)",
                                fontSize: "0.8125rem",
                              }}
                            >
                              {format(new Date(q.createdAt), "MMM d, yyyy")}
                            </td>
                            <td className="table-cell">
                              {q.conversationId && (
                                <button
                                  onClick={() =>
                                    openConversation(
                                      typeof q.conversationId === "string"
                                        ? q.conversationId
                                        : (q.conversationId as any)._id,
                                    )
                                  }
                                  className="btn btn-outline btn-sm"
                                  style={{
                                    display: "inline-flex",
                                    gap: "0.375rem",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  <MessageCircle
                                    style={{
                                      width: "0.75rem",
                                      height: "0.75rem",
                                    }}
                                  />{" "}
                                  Chat
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── TAB: EQUIPMENT QUOTE REQUESTS ─────────────────────────── */}
        {activeTab === "equipment" && (
          <motion.div {...fadeIn(0)}>
            <div className="card" style={{ padding: "1.25rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <h2 className="heading-sm">Equipment quote requests</h2>
                  <p className="meta" style={{ marginTop: 4 }}>
                    Baskets submitted from the shop, priced by the sales desk.
                  </p>
                </div>
                <Link to="/market" className="btn btn-secondary btn-sm">
                  Browse equipment
                </Link>
              </div>

              {!marketQuotes.length ? (
                <div style={{ padding: "2.5rem 1rem", textAlign: "center" }}>
                  <p className="muted">
                    No equipment quote requests yet. Add stock to the quote basket
                    and we will price it with delivery.
                  </p>
                  <Link
                    to="/market"
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: "0.875rem" }}
                  >
                    Open the shop
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {marketQuotes.map((quote) => (
                    <div
                      key={quote._id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0,1fr) auto auto",
                        gap: "1rem",
                        alignItems: "center",
                        padding: "0.875rem 0",
                        borderTop: "1px solid var(--color-border)",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                          {quote.referenceNumber}
                        </p>
                        <p className="meta">
                          {quote.items.length} line
                          {quote.items.length === 1 ? "" : "s"} ·{" "}
                          {new Date(quote.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className="badge badge-blue" style={{ textTransform: "capitalize" }}>
                        {quote.status}
                      </span>
                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {formatUSD(quote.quotedAmount ?? quote.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── TAB: MESSAGES ─────────────────────────────────────────── */}
        {activeTab === "messages" && (
          <motion.div {...fadeIn(0)}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.25rem",
              }}
            >
              <h2
                style={{
                  fontWeight: 700,
                  color: "var(--color-text)",
                  fontSize: "1rem",
                  margin: 0,
                }}
              >
                Conversations
              </h2>
              <button
                onClick={() => setChatOpen(true)}
                className="btn btn-primary btn-sm"
                style={{ display: "inline-flex", gap: "0.5rem" }}
              >
                <MessageCircle
                  style={{ width: "0.875rem", height: "0.875rem" }}
                />{" "}
                Open Chat
              </button>
            </div>

            {!conversations.length ? (
              <div
                className="card"
                style={{ padding: "5rem", textAlign: "center" }}
              >
                <MessageCircle
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    color: "var(--color-primary-400)",
                    margin: "0 auto 1rem",
                  }}
                />
                <h3
                  style={{
                    fontWeight: 700,
                    color: "var(--color-text)",
                    marginBottom: "0.5rem",
                  }}
                >
                  No conversations yet
                </h3>
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.875rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  Submit a quotation to open a conversation with our team.
                </p>
                <Link
                  to="/quotation"
                  className="btn btn-primary btn-sm"
                  style={{ display: "inline-flex", textDecoration: "none" }}
                >
                  Get a Quote First
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {conversations.map((conv: any) => (
                  <div
                    key={conv._id}
                    className="card"
                    style={{ padding: "1.125rem 1.25rem" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "1rem",
                      }}
                    >
                      <div
                        style={{
                          width: "2.75rem",
                          height: "2.75rem",
                          borderRadius: "10px",
                          background: "var(--color-primary-900)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          flexShrink: 0,
                        }}
                      >
                        MP
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "0.25rem",
                          }}
                        >
                          <p
                            style={{
                              fontWeight: 600,
                              color: "var(--color-text)",
                              fontSize: "0.9rem",
                              margin: 0,
                            }}
                          >
                            {conv.subject}
                          </p>
                          <span
                            className={cn(
                              "badge",
                              conv.status === "open"
                                ? "badge-green"
                                : "badge-gray",
                            )}
                          >
                            {conv.status}
                          </span>
                          {conv.unreadByUser > 0 && (
                            <span
                              style={{
                                width: "1.125rem",
                                height: "1.125rem",
                                borderRadius: "50%",
                                background: "#EF4444",
                                color: "#fff",
                                fontSize: "0.5625rem",
                                fontWeight: 700,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {conv.unreadByUser}
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--color-text-secondary)",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {conv.lastMessage || "No messages yet"}
                        </p>
                        {conv.lastMessageAt && (
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--color-text-tertiary)",
                              marginTop: "0.25rem",
                            }}
                          >
                            {formatDistanceToNow(new Date(conv.lastMessageAt))}{" "}
                            ago
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => openConversation(conv._id)}
                        className="btn btn-secondary btn-sm"
                        style={{
                          display: "inline-flex",
                          gap: "0.375rem",
                          flexShrink: 0,
                        }}
                      >
                        Open{" "}
                        <ArrowRight
                          style={{ width: "0.75rem", height: "0.75rem" }}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
