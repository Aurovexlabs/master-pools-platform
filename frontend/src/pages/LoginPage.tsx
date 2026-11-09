import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  GraduationCap,
  LogIn,
} from "lucide-react";

import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useLogin } from "../hooks/useApi";
import { useAuthStore } from "../stores/auth.store";
import type { LoginForm } from "../types";

const FEATURES = [
  "Submit and track pool quotations",
  "Real-time chat with our team",
  "Monitor project milestones",
  "Receive detailed cost breakdowns",
];

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const { mutate, isPending } = useLogin();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const completedProjects = 150;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = (data: LoginForm) => {
    mutate(data, {
      onSuccess: ({ token, user }) => {
        setAuth(user, token);
        toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
        navigate({ to: user.role === "admin" ? "/admin" : "/dashboard" });
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || "Invalid email or password";
        const needsVerification = Boolean(
          err.response?.data?.needsVerification,
        );
        toast.error(msg);
        if (needsVerification) {
          window.location.assign(
            `/verify-otp?email=${encodeURIComponent(data.email)}`,
          );
        }
      },
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "var(--color-bg)",
      }}
    >
      {/* Left panel — brand */}
      <div
        style={{
          flex: 1,
          background: "var(--color-sky-900)",
          flexDirection: "column",
          justifyContent: "center",
          padding: "4rem 3rem",
          position: "relative",
          overflow: "hidden",
        }}
        className="hidden lg:flex"
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: "-10rem",
            right: "-8rem",
            width: "30rem",
            height: "30rem",
            borderRadius: "50%",
            background: "rgba(99,102,241,0.12)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-8rem",
            left: "-6rem",
            width: "24rem",
            height: "24rem",
            borderRadius: "50%",
            background: "rgba(16,185,129,0.08)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "3rem",
            }}
          >
            <div
              style={{
                width: "2.75rem",
                height: "2.75rem",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GraduationCap
                style={{ width: "1.375rem", height: "1.375rem", color: "#fff" }}
              />
            </div>
            <div>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 800,
                  fontSize: "1.375rem",
                  color: "#fff",
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                Master
                <span style={{ color: "rgba(165,180,252,1)" }}>Pools</span>
              </p>
              <p
                style={{
                  fontSize: "0.5625rem",
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginTop: "0.0625rem",
                }}
              >
                Zimbabwe
              </p>
            </div>
          </div>

          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 800,
              fontSize: "2.25rem",
              color: "#fff",
              lineHeight: 1.15,
              marginBottom: "1rem",
              letterSpacing: "-0.025em",
            }}
          >
            Your dream pool,
            <br />
            delivered on time.
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "1rem",
              lineHeight: 1.7,
              marginBottom: "2.5rem",
              maxWidth: "22rem",
            }}
          >
            Join thousands of homeowners and businesses who trust MATERPOOLS AND CONTRUCTION to
            build extraordinary aquatic experiences.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.875rem",
            }}
          >
            {FEATURES.map((f) => (
              <div
                key={f}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: "1.375rem",
                    height: "1.375rem",
                    borderRadius: "50%",
                    background: "rgba(16,185,129,0.2)",
                    border: "1px solid rgba(16,185,129,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle
                    style={{
                      width: "0.75rem",
                      height: "0.75rem",
                      color: "#34D399",
                    }}
                  />
                </div>
                <span
                  style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}
                >
                  {f}
                </span>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: "2rem",
              marginTop: "3rem",
              paddingTop: "2rem",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {[
              [`${completedProjects}+`, "Pools Built"],
              ["15yrs", "Experience"],
              ["98%", "Satisfaction"],
            ].map(([val, lbl]) => (
              <div key={lbl}>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 800,
                    fontSize: "1.5rem",
                    color: "#fff",
                    margin: 0,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {val}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "0.75rem",
                    marginTop: "0.125rem",
                  }}
                >
                  {lbl}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.5rem",
          minHeight: "100vh",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ width: "100%", maxWidth: "26rem" }}
        >
          {/* Mobile logo */}
          <div
            style={{ textAlign: "center", marginBottom: "2rem" }}
            className="lg:hidden"
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.625rem",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  background: "var(--color-primary-900)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <GraduationCap
                  style={{ width: "1.25rem", height: "1.25rem", color: "#fff" }}
                />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 800,
                  fontSize: "1.375rem",
                  color: "var(--color-primary-900)",
                  letterSpacing: "-0.02em",
                }}
              >
                Master
                <span style={{ color: "var(--color-secondary-500)" }}>
                  Pools
                </span>
              </span>
            </div>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h1
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 800,
                fontSize: "1.75rem",
                color: "var(--color-text)",
                letterSpacing: "-0.025em",
                marginBottom: "0.375rem",
              }}
            >
              Welcome back
            </h1>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "0.9375rem",
              }}
            >
              Sign in to your MATERPOOLS AND CONTRUCTION account
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.125rem",
            }}
          >
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                })}
                className="input"
                placeholder="you@example.com"
                autoComplete="email"
                style={
                  errors.email
                    ? {
                        borderColor: "var(--color-danger)",
                        boxShadow: "0 0 0 3px rgba(239,68,68,0.1)",
                      }
                    : {}
                }
              />
              {errors.email && (
                <p
                  style={{
                    color: "var(--color-danger)",
                    fontSize: "0.75rem",
                    marginTop: "0.375rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                  })}
                  className="input"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{
                    paddingRight: "2.75rem",
                    ...(errors.password
                      ? {
                          borderColor: "var(--color-danger)",
                          boxShadow: "0 0 0 3px rgba(239,68,68,0.1)",
                        }
                      : {}),
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-gray-400)",
                    padding: 0,
                    display: "flex",
                  }}
                >
                  {showPass ? (
                    <EyeOff style={{ width: "1rem", height: "1rem" }} />
                  ) : (
                    <Eye style={{ width: "1rem", height: "1rem" }} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  style={{
                    color: "var(--color-danger)",
                    fontSize: "0.75rem",
                    marginTop: "0.375rem",
                  }}
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.8125rem",
                fontSize: "0.9375rem",
                fontWeight: 700,
                background: "var(--color-primary-900)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: "0 4px 14px rgba(30,58,138,0.25)",
                marginTop: "0.5rem",
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? (
                <>
                  <span
                    style={{
                      width: "1rem",
                      height: "1rem",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid #fff",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn style={{ width: "1rem", height: "1rem" }} /> Sign In
                </>
              )}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              color: "var(--color-text-secondary)",
              fontSize: "0.875rem",
              marginTop: "1.5rem",
            }}
          >
            <a
              href="/forgot-password"
              style={{
                color: "var(--color-primary-900)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Forgot password?
            </a>
          </p>

          <p
            style={{
              textAlign: "center",
              color: "var(--color-text-secondary)",
              fontSize: "0.875rem",
              marginTop: "0.75rem",
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "var(--color-primary-900)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Create one free{" "}
              <ArrowRight
                style={{
                  width: "0.75rem",
                  height: "0.75rem",
                  display: "inline",
                  verticalAlign: "middle",
                }}
              />
            </Link>
          </p>

          {/* Demo credentials removed */}
        </motion.div>
      </div>
    </div>
  );
}
