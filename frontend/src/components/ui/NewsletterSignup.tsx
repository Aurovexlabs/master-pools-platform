import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/client";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    setLoading(true);
    try {
      const res = await api.post("/newsletter/", { email, name });
      toast.success(res.data?.message || "Subscribed");
      setEmail("");
      setName("");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 w-full max-w-md"
    >
      <input
        aria-label="Name"
        placeholder="Your name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input h-9 text-[13px]"
      />
      <input
        aria-label="Email"
        placeholder="you@yourdomain.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input h-9 text-[13px]"
        type="email"
        required
      />
      <button
        type="submit"
        className="btn btn-primary btn-sm w-full"
        disabled={loading}
      >
        {loading ? "Subscribing…" : "Subscribe"}
      </button>
    </form>
  );
}
