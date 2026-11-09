import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle,
  Droplets,
  Home,
  Infinity,
  Info,
  Leaf,
  Plus,
  Snowflake,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useCreateQuotation } from "../hooks/useApi";
import { useAuthStore } from "../stores/auth.store";

const POOL_TYPES = [
  { key: "residential", icon: Home, label: "Residential" },
  { key: "commercial", icon: Building2, label: "Commercial" },
  { key: "olympic", icon: Droplets, label: "Olympic" },
  { key: "infinity", icon: Infinity, label: "Infinity" },
  { key: "indoor", icon: Snowflake, label: "Indoor" },
  { key: "natural", icon: Leaf, label: "Natural" },
  { key: "custom", icon: Sparkles, label: "Custom" },
];
const POOL_SHAPES = [
  "rectangular",
  "oval",
  "kidney",
  "freeform",
  "circular",
  "lap",
  "custom",
];
const POOL_FEATURES = [
  "Heating System",
  "LED Lighting",
  "Infinity Edge",
  "Waterfall Feature",
  "Swim Jet",
  "Auto Cover",
  "Solar Heating",
  "Salt Chlorination",
  "UV Filtration",
  "Spa/Jacuzzi Section",
  "Diving Board",
  "Slide",
  "Night Lighting",
  "Underwater Speakers",
  "Depth Markings",
  "Starting Blocks",
];
const STEPS = [
  "Pool Type",
  "Dimensions",
  "Features",
  "Location & Budget",
  "Review",
];

export default function QuotationPage() {
  const [step, setStep] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const { mutate, isPending } = useCreateQuotation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, watch } = useForm();
  const poolType = watch("poolType");
  const poolShape = watch("poolShape");

  const toggleFeature = (f: string) =>
    setSelectedFeatures((p) =>
      p.includes(f) ? p.filter((x) => x !== f) : [...p, f],
    );

  const onSubmit = (data: any) => {
    mutate(
      {
        poolType: data.poolType,
        poolShape: data.poolShape,
        dimensions: {
          length: data.length ? Number(data.length) : undefined,
          width: data.width ? Number(data.width) : undefined,
          depth: data.depth ? Number(data.depth) : undefined,
          unit: "meters",
        },
        features: selectedFeatures,
        location: {
          address: data.address,
          city: data.city,
          country: data.country || "Zimbabwe",
        },
        budget: {
          min: data.budgetMin ? Number(data.budgetMin) : undefined,
          max: data.budgetMax ? Number(data.budgetMax) : undefined,
          currency: "USD",
        },
        timeline: data.timeline,
        additionalNotes: data.additionalNotes,
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          toast.success("Quotation submitted!");
        },
        onError: (e: any) =>
          toast.error(e.response?.data?.message || "Failed to submit"),
      },
    );
  };

  const stepCircle = (active: boolean, done: boolean) => ({
    width: "2.25rem",
    height: "2.25rem",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.875rem",
    fontWeight: 700,
    flexShrink: 0,
    transition: "all 0.3s ease",
    border: "2px solid",
    borderColor: done
      ? "var(--color-primary-900)"
      : active
        ? "var(--color-primary-900)"
        : "var(--color-border)",
    background: done
      ? "var(--color-primary-900)"
      : active
        ? "#fff"
        : "var(--color-gray-50)",
    color: done
      ? "#fff"
      : active
        ? "var(--color-primary-900)"
        : "var(--color-gray-400)",
    boxShadow: active ? "0 0 0 4px var(--color-primary-50)" : "none",
  });

  // ── Success screen ──────────────────────────────────────────────────────
  if (submitted)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card"
          style={{
            maxWidth: "30rem",
            width: "100%",
            textAlign: "center",
            padding: "3.5rem 2rem",
          }}
        >
          <div
            style={{
              width: "6rem",
              height: "6rem",
              borderRadius: "50%",
              background: "var(--color-accent-50)",
              border: "2px solid var(--color-accent-100)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <CheckCircle
              style={{
                width: "3rem",
                height: "3rem",
                color: "var(--color-accent-600)",
              }}
            />
          </div>
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "2rem",
              fontWeight: 800,
              color: "var(--color-text)",
              marginBottom: "0.75rem",
              letterSpacing: "-0.025em",
            }}
          >
            Quotation Submitted!
          </h2>
          <p
            style={{
              color: "var(--color-text-secondary)",
              marginBottom: "0.75rem",
              lineHeight: 1.65,
            }}
          >
            Our team will review your request and provide a detailed quote
            within 24 hours.
          </p>
          <p
            style={{
              color: "var(--color-text-tertiary)",
              fontSize: "0.875rem",
              marginBottom: "2.5rem",
            }}
          >
            You can track progress and chat with our designers on your
            dashboard.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.875rem",
            }}
          >
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Go to Dashboard{" "}
              <ArrowRight style={{ width: "1.125rem", height: "1.125rem" }} />
            </button>
            <Link
              to="/projects"
              className="btn btn-secondary btn-md"
              style={{ justifyContent: "center", textDecoration: "none" }}
            >
              Explore More Projects
            </Link>
          </div>
        </motion.div>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        paddingBottom: "6rem",
      }}
    >
      <div style={{ maxWidth: "44rem", margin: "0 auto", padding: "0 1.5rem" }}>
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "3rem",
            paddingTop: "3rem",
          }}
        >
          <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>
            Consultation Request
          </p>
          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(2rem,5vw,3rem)",
              fontWeight: 800,
              color: "var(--color-text)",
              marginBottom: "1rem",
              letterSpacing: "-0.03em",
            }}
          >
            Design Your <span className="accent-heading">Dream Pool</span>
          </h1>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "1.0625rem",
              lineHeight: 1.65,
              maxWidth: "32rem",
              margin: "0 auto",
            }}
          >
            Complete this brief form and receive a detailed commercial quotation
            within one business day.
          </p>
        </div>

        {/* Progress steps */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "2.5rem",
            padding: "0 1rem",
          }}
        >
          {STEPS.map((s, i) => (
            <div
              key={s}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                flex: i === STEPS.length - 1 ? "0 0 auto" : "1",
              }}
            >
              <div style={stepCircle(i === step, i < step)}>
                {i < step ? (
                  <CheckCircle style={{ width: "1rem", height: "1rem" }} />
                ) : (
                  i + 1
                )}
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  color:
                    i === step
                      ? "var(--color-primary-900)"
                      : "var(--color-gray-400)",
                  whiteSpace: "nowrap",
                  fontWeight: i === step ? 700 : 500,
                }}
                className="md:block"
              >
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: "2px",
                    background:
                      i < step
                        ? "var(--color-primary-900)"
                        : "var(--color-gray-200)",
                    transition: "background 0.3s ease",
                    marginLeft: "0.25rem",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {/* ── Step 0: Pool Type ── */}
            {step === 0 && (
              <motion.div
                key="s0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card"
                style={{ padding: "2.5rem" }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: "var(--color-text)",
                    marginBottom: "0.5rem",
                    letterSpacing: "-0.02em",
                  }}
                >
                  What type of pool?
                </h2>
                <p
                  style={{
                    color: "var(--color-text-tertiary)",
                    fontSize: "0.875rem",
                    marginBottom: "2rem",
                  }}
                >
                  Select the category that best describes your vision.
                </p>
                <div
                  style={{
                    display: "grid",
                    gap: "0.875rem",
                    marginBottom: "2rem",
                  }}
                  className="grid-mobile-1-4"
                >
                  {POOL_TYPES.map((t) => (
                    <label
                      key={t.key}
                      style={{
                        cursor: "pointer",
                        borderRadius: "12px",
                        border: "2px solid",
                        borderColor:
                          poolType === t.key
                            ? "var(--color-primary-900)"
                            : "var(--color-border)",
                        padding: "1.25rem 0.75rem",
                        textAlign: "center",
                        transition: "all 0.2s ease",
                        background:
                          poolType === t.key
                            ? "var(--color-primary-50)"
                            : "transparent",
                        boxShadow:
                          poolType === t.key
                            ? "0 4px 12px rgba(30,58,138,0.08)"
                            : "none",
                      }}
                    >
                      <input
                        type="radio"
                        value={t.key}
                        {...register("poolType")}
                        style={{ display: "none" }}
                      />
                      <t.icon
                        style={{
                          width: "2rem",
                          height: "2rem",
                          marginBottom: "0.5rem",
                          color: "var(--color-primary-700)",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 700,
                          color:
                            poolType === t.key
                              ? "var(--color-primary-900)"
                              : "var(--color-text-secondary)",
                        }}
                      >
                        {t.label}
                      </div>
                    </label>
                  ))}
                </div>

                <h3
                  style={{
                    fontWeight: 700,
                    color: "var(--color-text)",
                    fontSize: "0.9375rem",
                    marginBottom: "1rem",
                  }}
                >
                  Desired Shape
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    marginBottom: "2.5rem",
                  }}
                >
                  {POOL_SHAPES.map((s) => (
                    <label
                      key={s}
                      style={{
                        cursor: "pointer",
                        padding: "0.5rem 1rem",
                        borderRadius: "999px",
                        border: "1px solid",
                        borderColor:
                          poolShape === s
                            ? "var(--color-primary-900)"
                            : "var(--color-border)",
                        background:
                          poolShape === s ? "var(--color-primary-900)" : "#fff",
                        transition: "all 0.2s ease",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        textTransform: "capitalize",
                        color:
                          poolShape === s ? "#fff" : "var(--color-gray-600)",
                        boxShadow:
                          poolShape === s
                            ? "0 4px 10px rgba(30,58,138,0.2)"
                            : "var(--shadow-xs)",
                      }}
                    >
                      <input
                        type="radio"
                        value={s}
                        {...register("poolShape")}
                        style={{ display: "none" }}
                      />
                      {s}
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (poolType && poolShape) setStep(1);
                    else toast.error("Please select pool type and shape");
                  }}
                  className="btn btn-primary btn-lg"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Next: Dimensions{" "}
                  <ArrowRight
                    style={{ width: "1.125rem", height: "1.125rem" }}
                  />
                </button>
              </motion.div>
            )}

            {/* ── Step 1: Dimensions ── */}
            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card"
                style={{ padding: "2.5rem" }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: "var(--color-text)",
                    marginBottom: "0.5rem",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Pool Dimensions
                </h2>
                <p
                  style={{
                    color: "var(--color-text-tertiary)",
                    fontSize: "0.875rem",
                    marginBottom: "2rem",
                  }}
                >
                  Estimates are fine — we will confirm exact measurements during
                  our visit.
                </p>

                <div
                  style={{
                    display: "grid",
                    gap: "1rem",
                    marginBottom: "2rem",
                  }}
                  className="grid-mobile-1-3"
                >
                  {[
                    { f: "length", l: "Length (m)", p: "e.g. 10" },
                    { f: "width", l: "Width (m)", p: "e.g. 5" },
                    { f: "depth", l: "Depth (m)", p: "e.g. 1.5" },
                  ].map(({ f, l, p }) => (
                    <div key={f}>
                      <label className="label">{l}</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        {...register(f)}
                        className="input"
                        placeholder={p}
                        style={{ background: "var(--color-gray-50)" }}
                      />
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    background: "var(--color-primary-50)",
                    border: "1px solid var(--color-primary-100)",
                    borderRadius: "12px",
                    padding: "1.25rem",
                    marginBottom: "2rem",
                    display: "flex",
                    gap: "0.875rem",
                    alignItems: "flex-start",
                  }}
                >
                  <Info
                    style={{
                      width: "1.125rem",
                      height: "1.125rem",
                      color: "var(--color-primary-600)",
                      flexShrink: 0,
                      marginTop: "0.125rem",
                    }}
                  />
                  <p
                    style={{
                      color: "var(--color-primary-800)",
                      fontSize: "0.875rem",
                      lineHeight: 1.6,
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    Precision matters. Our engineers will perform a site survey
                    to assess terrain, soil stability, and plumbing access.
                  </p>
                </div>

                <div className="stack-mobile" style={{ gap: "1rem" }}>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="btn btn-secondary btn-lg"
                    style={{ justifyContent: "center" }}
                  >
                    <ArrowLeft
                      style={{ width: "1.125rem", height: "1.125rem" }}
                    />{" "}
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn btn-primary btn-lg"
                    style={{ justifyContent: "center" }}
                  >
                    Next: Features{" "}
                    <ArrowRight
                      style={{ width: "1.125rem", height: "1.125rem" }}
                    />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Features ── */}
            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card"
                style={{ padding: "2.5rem" }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: "var(--color-text)",
                    marginBottom: "0.5rem",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Desired Features
                </h2>
                <p
                  style={{
                    color: "var(--color-text-tertiary)",
                    fontSize: "0.875rem",
                    marginBottom: "2rem",
                  }}
                >
                  Select all features you'd like us to include in your
                  quotation.
                </p>

                <div
                  style={{
                    display: "grid",
                    gap: "0.625rem",
                    marginBottom: "2rem",
                  }}
                  className="grid-mobile-1-3"
                >
                  {POOL_FEATURES.map((f) => {
                    const sel = selectedFeatures.includes(f);
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleFeature(f)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.625rem",
                          padding: "0.75rem 0.875rem",
                          borderRadius: "10px",
                          border: "1px solid",
                          borderColor: sel
                            ? "var(--color-primary-900)"
                            : "var(--color-border)",
                          background: sel ? "var(--color-primary-900)" : "#fff",
                          transition: "all 0.15s ease",
                          fontSize: "0.8125rem",
                          textAlign: "left",
                          cursor: "pointer",
                          fontWeight: 600,
                          color: sel ? "#fff" : "var(--color-gray-600)",
                          boxShadow: sel
                            ? "0 4px 10px rgba(30,58,138,0.2)"
                            : "none",
                        }}
                      >
                        {sel ? (
                          <X
                            style={{
                              width: "0.875rem",
                              height: "0.875rem",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <Plus
                            style={{
                              width: "0.875rem",
                              height: "0.875rem",
                              flexShrink: 0,
                              color: "var(--color-gray-300)",
                            }}
                          />
                        )}
                        {f}
                      </button>
                    );
                  })}
                </div>

                {selectedFeatures.length > 0 && (
                  <p
                    style={{
                      color: "var(--color-primary-600)",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      marginBottom: "1.25rem",
                    }}
                  >
                    ✓ {selectedFeatures.length} feature
                    {selectedFeatures.length > 1 ? "s" : ""} selected
                  </p>
                )}

                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn btn-secondary btn-lg"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    <ArrowLeft
                      style={{ width: "1.125rem", height: "1.125rem" }}
                    />{" "}
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn btn-primary btn-lg"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    Next: Location{" "}
                    <ArrowRight
                      style={{ width: "1.125rem", height: "1.125rem" }}
                    />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Location ── */}
            {step === 3 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card"
                style={{ padding: "2.5rem" }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: "var(--color-text)",
                    marginBottom: "1.5rem",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Location & Budget
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.25rem",
                    marginBottom: "2rem",
                  }}
                >
                  <div>
                    <label className="label">Site Address</label>
                    <input
                      {...register("address")}
                      className="input"
                      placeholder="123 Example Street"
                      style={{ background: "var(--color-gray-50)" }}
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gap: "1rem",
                    }}
                    className="grid-mobile-1-2"
                  >
                    <div>
                      <label className="label">City</label>
                      <input
                        {...register("city")}
                        className="input"
                        placeholder="Harare"
                        style={{ background: "var(--color-gray-50)" }}
                      />
                    </div>
                    <div>
                      <label className="label">Country</label>
                      <input
                        {...register("country")}
                        className="input"
                        placeholder="Zimbabwe"
                        defaultValue="Zimbabwe"
                        style={{ background: "var(--color-gray-50)" }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">
                      Budget Range (USD){" "}
                      <span
                        style={{
                          color: "var(--color-text-tertiary)",
                          fontWeight: 400,
                        }}
                      >
                        — optional
                      </span>
                    </label>
                    <div
                      style={{
                        display: "grid",
                        gap: "1rem",
                      }}
                      className="grid-mobile-1-2"
                    >
                      <input
                        type="number"
                        {...register("budgetMin")}
                        className="input"
                        placeholder="Min USD"
                        style={{ background: "var(--color-gray-50)" }}
                      />
                      <input
                        type="number"
                        {...register("budgetMax")}
                        className="input"
                        placeholder="Max USD"
                        style={{ background: "var(--color-gray-50)" }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Timeline</label>
                    <select
                      {...register("timeline")}
                      className="select"
                      style={{ background: "var(--color-gray-50)" }}
                    >
                      <option value="">Select desired timeline</option>
                      {[
                        "ASAP",
                        "1-3 months",
                        "3-6 months",
                        "6-12 months",
                        "1+ years",
                        "Flexible",
                      ].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Additional Notes</label>
                    <textarea
                      {...register("additionalNotes")}
                      rows={3}
                      className="textarea"
                      placeholder="Special requirements, site access issues..."
                      style={{ background: "var(--color-gray-50)" }}
                    />
                  </div>
                </div>
                <div className="stack-mobile" style={{ gap: "1rem" }}>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn btn-secondary btn-lg"
                    style={{ justifyContent: "center" }}
                  >
                    <ArrowLeft
                      style={{ width: "1.125rem", height: "1.125rem" }}
                    />{" "}
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="btn btn-primary btn-lg"
                    style={{ justifyContent: "center" }}
                  >
                    Review Request{" "}
                    <ArrowRight
                      style={{ width: "1.125rem", height: "1.125rem" }}
                    />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 4: Review ── */}
            {step === 4 && (
              <motion.div
                key="s4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card"
                style={{ padding: "2.5rem" }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: "var(--color-text)",
                    marginBottom: "1.5rem",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Confirm Your Request
                </h2>

                <div
                  style={{
                    background: "var(--color-gray-50)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    marginBottom: "2rem",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gap: "1.25rem",
                    }}
                    className="grid-mobile-1-2"
                  >
                    {[
                      ["Pool Type", watch("poolType")],
                      ["Shape", watch("poolShape")],
                      [
                        "Dimensions",
                        watch("length") && watch("width")
                          ? `${watch("length")}m × ${watch("width")}m${watch("depth") ? ` × ${watch("depth")}m` : ""}`
                          : "To be confirmed",
                      ],
                      ["Location", watch("city") || "—"],
                      [
                        "Budget",
                        watch("budgetMin") || watch("budgetMax")
                          ? `$${watch("budgetMin") || "?"} – $${watch("budgetMax") || "?"} USD`
                          : "Not specified",
                      ],
                      ["Timeline", watch("timeline") || "Flexible"],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <p
                          style={{
                            fontSize: "0.6875rem",
                            color: "var(--color-text-tertiary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            fontWeight: 700,
                            marginBottom: "0.25rem",
                          }}
                        >
                          {label}
                        </p>
                        <p
                          style={{
                            fontSize: "0.9375rem",
                            color: "var(--color-text)",
                            fontWeight: 600,
                            textTransform: "capitalize",
                            margin: 0,
                          }}
                        >
                          {val}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(14,165,233,0.08)",
                    border: "1px solid rgba(14,165,233,0.25)",
                    borderRadius: "14px",
                    padding: "1.25rem",
                    marginBottom: "2rem",
                  }}
                >
                  <p
                    style={{
                      color: "#0F4C81",
                      fontWeight: 700,
                      margin: "0 0 0.5rem",
                      fontSize: "1rem",
                    }}
                  >
                    What happens next
                  </p>
                  <p
                    style={{
                      color: "#0F4C81",
                      fontSize: "0.875rem",
                      lineHeight: 1.6,
                      margin: 0,
                      opacity: 0.85,
                    }}
                  >
                    Our team reviews your request, confirms your details, and
                    prepares a tailored quotation with the next steps clearly
                    outlined.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn btn-secondary btn-lg"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    <ArrowLeft
                      style={{ width: "1.125rem", height: "1.125rem" }}
                    />{" "}
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="btn btn-primary btn-lg"
                    style={{ flex: 2, justifyContent: "center" }}
                  >
                    {isPending ? (
                      <>
                        <span
                          style={{
                            width: "1.125rem",
                            height: "1.125rem",
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTop: "2px solid #fff",
                            borderRadius: "50%",
                            animation: "spin 0.8s linear infinite",
                            display: "inline-block",
                          }}
                        />{" "}
                        Submitting…
                      </>
                    ) : (
                      <>
                        <CheckCircle
                          style={{ width: "1.25rem", height: "1.25rem" }}
                        />{" "}
                        Confirm & Submit
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}
