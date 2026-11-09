import { Link } from "@tanstack/react-router";
import {
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import PhotoBanner from "../components/public/PhotoBanner";
import QuotationCta from "../components/public/QuotationCta";
import { POOL_PHOTOS } from "../data/poolPhotos";
import { MetaHead } from "../components/seo/MetaHead";
import {
  StructuredData,
  breadcrumbSchema,
  organizationSchema,
} from "../components/seo/StructuredData";
import { COMPANY } from "../data/company";
import { useSubmitContact } from "../hooks/useApi";
import type { ContactForm } from "../types";

const SUBJECTS = [
  "General enquiry",
  "Request a quotation",
  "Pool construction",
  "Renovation or repairs",
  "Maintenance contract",
  "Equipment supply",
  "Existing project",
  "Something else",
];

const CHANNELS = [
  {
    icon: Phone,
    label: "Sales desk",
    value: COMPANY.phone,
    href: COMPANY.phoneHref,
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Message the sales desk",
    href: COMPANY.whatsappHref,
    external: true,
  },
  {
    icon: Mail,
    label: "Email",
    value: COMPANY.email,
    href: `mailto:${COMPANY.email}`,
  },
];

const NEXT_STEPS = [
  {
    step: "01",
    title: "We reply",
    body: "The sales desk answers the enquiry and asks for anything missing.",
  },
  {
    step: "02",
    title: "Site visit",
    body: "An assessment of access, ground conditions and existing services.",
  },
  {
    step: "03",
    title: "Quotation",
    body: "Itemised scope and programme, agreed in writing before work starts.",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const { mutate, isPending } = useSubmitContact();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactForm>();

  const onSubmit = (data: ContactForm) => {
    mutate(data, {
      onSuccess: () => {
        setSubmitted(true);
        reset();
        toast.success("Message sent");
      },
      onError: () => toast.error("The message could not be sent. Try again."),
    });
  };

  return (
    <>
      <MetaHead
        title="Contact MasterPools | Zimbabwe"
        description="Contact MasterPools about pool construction, renovation, maintenance or equipment anywhere in Zimbabwe. Call +263 772 562 125 or send an enquiry."
        canonical={`${COMPANY.siteUrl}/contact`}
      />
      <StructuredData schema={organizationSchema} />
      <StructuredData
        schema={breadcrumbSchema([
          { name: "Home", url: `${COMPANY.siteUrl}/` },
          { name: "Contact", url: `${COMPANY.siteUrl}/contact` },
        ])}
      />

      <PhotoBanner
        image={POOL_PHOTOS.banner.url}
        title="Contact MasterPools"
        align="center 60%"
        intro="Tell us about the site and the work required. Enquiries are answered by the sales desk in Harare."
      />

      {/* ── Direct channels ──────────────────────────────────────────────── */}
      <section className="border-b border-ink-200 bg-surface">
        <div className="container-xl grid gap-x-10 gap-y-6 py-7 sm:grid-cols-3">
          {CHANNELS.map(({ icon: Icon, label, value, href, external }) => (
            <a
              key={label}
              href={href}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="group flex items-start gap-3"
            >
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-ink-200 bg-white text-sky-600">
                <Icon size={15} strokeWidth={2} aria-hidden="true" />
              </span>
              <span>
                <span className="data-label">{label}</span>
                <span className="mt-1 block text-[14px] font-semibold text-ink-900 group-hover:text-sky-700">
                  {value}
                </span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <div className="container-xl py-10 lg:py-14">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-14">
          {/* Left: what happens, hours, centres */}
          <div>
            <h2 className="mb-5 font-display text-[24px] font-bold tracking-[-0.024em] text-ink-900 sm:text-[28px]">
              What happens next
            </h2>
            <div>
              {NEXT_STEPS.map((item) => (
                <div
                  key={item.step}
                  className="grid grid-cols-[30px_minmax(0,1fr)] gap-3 border-t border-ink-200 py-4"
                >
                  <span className="pt-0.5 font-display text-[13px] font-bold tabular-nums text-sky-700">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="mb-1 font-display text-[15px] font-bold text-ink-900">
                      {item.title}
                    </h3>
                    <p className="max-w-[330px] text-[13.5px] leading-relaxed text-ink-600">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <span className="data-label inline-flex items-center gap-1.5">
                  <Clock size={12} aria-hidden="true" /> Office hours
                </span>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-700">
                  Monday to Friday, 08:00 – 17:00
                  <br />
                  Saturday, 09:00 – 13:00
                </p>
              </div>
              <div>
                <span className="data-label inline-flex items-center gap-1.5">
                  <MapPin size={12} aria-hidden="true" /> Operating in
                </span>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-700">
                  {COMPANY.coverage}. Run from {COMPANY.basesLabel}.
                </p>
              </div>
            </div>
          </div>

          {/* Right: enquiry form */}
          <div className="rounded-xl border border-ink-200 bg-white p-6 sm:p-8">
            {submitted ? (
              <div className="flex flex-col items-center py-12 text-center">
                <span className="mb-4 grid h-14 w-14 place-items-center rounded-full border border-sky-100 bg-sky-50">
                  <CheckCircle
                    size={26}
                    strokeWidth={1.8}
                    className="text-sky-600"
                    aria-hidden="true"
                  />
                </span>
                <h2 className="font-display text-[22px] font-bold tracking-[-0.02em] text-ink-900">
                  Message sent
                </h2>
                <p className="mt-2 mb-6 max-w-[340px] text-[13.5px] leading-relaxed text-ink-600">
                  The sales desk has your enquiry and will reply to the address
                  you gave.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="btn btn-secondary btn-md"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="mb-1 font-display text-[22px] font-bold tracking-[-0.02em] text-ink-900">
                  Send an enquiry
                </h2>
                <p className="mb-6 text-[13.5px] text-ink-600">
                  Fields marked with an asterisk are required.
                </p>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-5"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor="name">
                        Full name *
                      </label>
                      <input
                        id="name"
                        {...register("name", { required: "Name required" })}
                        className="input"
                        placeholder="First and last name"
                        aria-invalid={Boolean(errors.name)}
                      />
                      {errors.name && (
                        <p className="field-error">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="label" htmlFor="email">
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        {...register("email", {
                          required: "Email required",
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: "Enter a valid email",
                          },
                        })}
                        className="input"
                        placeholder="you@example.com"
                        aria-invalid={Boolean(errors.email)}
                      />
                      {errors.email && (
                        <p className="field-error">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor="phone">
                        Phone <span className="font-normal text-ink-400">(optional)</span>
                      </label>
                      <input
                        id="phone"
                        {...register("phone")}
                        className="input"
                        placeholder="+263 77 000 0000"
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="subject">
                        Subject *
                      </label>
                      <select
                        id="subject"
                        {...register("subject", {
                          required: "Choose a subject",
                        })}
                        className="select"
                        aria-invalid={Boolean(errors.subject)}
                      >
                        <option value="">Select a subject</option>
                        {SUBJECTS.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                      {errors.subject && (
                        <p className="field-error">{errors.subject.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="label" htmlFor="message">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      {...register("message", {
                        required: "Message required",
                        minLength: {
                          value: 20,
                          message: "Please give at least 20 characters",
                        },
                      })}
                      className="textarea"
                      placeholder="The site address, the work required, and when you would like it done."
                      aria-invalid={Boolean(errors.message)}
                    />
                    {errors.message && (
                      <p className="field-error">{errors.message.message}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="btn btn-primary btn-lg"
                    >
                      <Send size={16} strokeWidth={2} aria-hidden="true" />
                      {isPending ? "Sending…" : "Send message"}
                    </button>
                    <a
                      href={COMPANY.whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="textlink"
                    >
                      <MessageCircle size={14} aria-hidden="true" />
                      Or message on WhatsApp
                    </a>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        <p className="mt-10 border-t border-ink-200 pt-5 text-[13.5px] text-ink-600">
          Looking for a written quote instead?{" "}
          <Link to="/quotation" className="font-semibold text-sky-700 hover:underline">
            Request a quotation
          </Link>{" "}
          — it asks for the pool type, dimensions and site details up front.
        </p>
      </div>

      <QuotationCta />
    </>
  );
}
