"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Lock,
  Mail,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import MotionReveal from "@/components/shared/MotionReveal";
import PageContainer from "@/components/shared/PageContainer";
import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { paymentApi } from "@/lib/api";
import {
  buildPaymentPayload,
  getPremiumRedirectTarget,
  isPremiumSubscription,
  PREMIUM_PLAN,
} from "@/lib/payments";
import { toastError, toastWarning } from "@/lib/toast";

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

function SecurityBadge({ icon: Icon, label }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-medium text-white/82">
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
  );
}

function Field({ icon: Icon, label, name, onChange, placeholder, type = "text", value }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <div className="flex min-h-[54px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 transition focus-within:border-primary/40">
        <Icon className="h-4 w-4 text-slate-400" />
        <input
          className="w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          value={value}
        />
      </div>
    </label>
  );
}

function StatusCard({ onRetry, state }) {
  const shouldReduceMotion = useReducedMotion();

  if (state === "idle" || state === "processing") {
    return null;
  }

  return (
    <div className="rounded-[26px] border border-rose-200 bg-rose-50 p-5">
      <div className="flex items-start gap-3">
        <motion.div
          animate={shouldReduceMotion ? undefined : { scale: [0.96, 1.04, 1] }}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600"
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <TriangleAlert className="h-5 w-5" />
        </motion.div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-rose-700">Payment failed</h3>
          <p className="mt-2 text-sm leading-6 text-rose-700/85">
            We couldn&apos;t start secure Stripe checkout yet. Please review the error and retry.
          </p>
          <Button className="mt-4" onPress={onRetry} size="sm" variant="danger">
            Retry Payment
          </Button>
        </div>
      </div>
    </div>
  );
}

function PaymentPageContent() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = getPremiumRedirectTarget(searchParams.get("returnTo") || "");
  const wasPaymentCancelled = searchParams.get("payment") === "cancelled";
  const cancelledMessage = "Stripe checkout was cancelled before payment completed.";
  const [values, setValues] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
    nameOnCard: user?.name || "",
    billingEmail: user?.email || "",
  });
  const [state, setState] = useState({
    status: "idle",
    error: "",
  });

  const isPremiumUser = isPremiumSubscription(user?.subscription);

  useEffect(() => {
    if (!wasPaymentCancelled) {
      return;
    }

    toastWarning(cancelledMessage);
  }, [cancelledMessage, wasPaymentCancelled]);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({
      ...current,
      [name]:
        name === "cardNumber"
          ? value.replace(/[^\d\s]/g, "").slice(0, 19)
          : name === "expiry"
            ? value.replace(/[^\d/]/g, "").slice(0, 5)
            : name === "cvc"
              ? value.replace(/[^\d]/g, "").slice(0, 4)
              : value,
    }));
  }

  async function handlePayment(event) {
    event.preventDefault();

    if (!isAuthenticated) {
      toastError("Please log in before purchasing premium.");
      router.push(`/login?next=${encodeURIComponent(`/payment${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`)}`);
      return;
    }

    if (!values.nameOnCard.trim() || !values.billingEmail.trim()) {
      toastError("Please complete the billing details.");
      return;
    }

    setState({
      status: "processing",
      error: "",
    });

    try {
      console.info("[payment] Starting Stripe checkout session", {
        billingEmail: values.billingEmail,
        hasBillingName: Boolean(values.nameOnCard.trim()),
        hasPublishableKey: Boolean(STRIPE_PUBLISHABLE_KEY),
      });

      const sessionResponse = await paymentApi.createCheckoutSession(buildPaymentPayload(values, user, { returnTo }));

      console.info("[payment] Stripe checkout session created", {
        sessionId: sessionResponse?.sessionId,
        hasUrl: Boolean(sessionResponse?.url),
      });

      if (sessionResponse?.url) {
        if (!STRIPE_PUBLISHABLE_KEY) {
          console.warn("[payment] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured. Redirecting with the hosted Checkout URL.");
        }

        window.location.assign(sessionResponse.url);
        return;
      }

      throw new Error("Stripe checkout session was created, but no hosted Checkout URL was returned.");
    } catch (error) {
      console.error("[payment] Unable to start Stripe checkout", {
        message: error?.message,
        status: error?.status,
        data: error?.data,
      });

      toastError(error.message || "Unable to complete payment.");
      setState({
        status: "failed",
        error: error.message || "Unable to complete payment.",
      });
    }
  }

  if (isPremiumUser) {
    return (
      <PageContainer className="py-12" size="lg">
        <ErrorState
          description="This account already has premium access. You can review benefits and payment history from the premium status page."
          onRetry={() => router.push("/premium")}
          title="Premium already active"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8 py-10 md:py-14" size="xl">
      <MotionReveal preset="contentFade">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link className="text-primary transition hover:text-secondary" href="/">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link className="text-primary transition hover:text-secondary" href="/pricing">
            Pricing
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>Payment</span>
        </div>
      </MotionReveal>

      <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
        <MotionReveal preset="viewportReveal">
          <aside className="overflow-hidden rounded-[30px] border border-primary/16 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.26),transparent_28%),linear-gradient(135deg,#081122_0%,#121b33_55%,#1b2550_100%)] p-6 text-white shadow-[0_26px_90px_rgba(15,23,42,0.24)] md:p-7">
            <span className="inline-flex rounded-full border border-white/14 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/82">
              Secure Checkout
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight">Complete your premium upgrade</h1>
            <p className="mt-4 text-sm leading-7 text-white/74">
              You&apos;re one payment away from unlocking PromptFlow premium prompts, private creator content, and smoother workflow tools.
            </p>

            <div className="mt-6 rounded-[26px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">{PREMIUM_PLAN.name}</p>
                  <p className="mt-2 text-sm text-white/70">{PREMIUM_PLAN.billingLabel}</p>
                </div>
                <span className="text-4xl font-semibold tracking-tight">$5</span>
              </div>
              <div className="mt-5 space-y-3">
                {PREMIUM_PLAN.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-white/82">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                      <BadgeCheck className="h-4 w-4" />
                    </span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <SecurityBadge icon={ShieldCheck} label="SSL secured" />
              <SecurityBadge icon={Lock} label="Stripe hosted card entry" />
              <SecurityBadge icon={Sparkles} label="Premium unlock" />
            </div>
          </aside>
        </MotionReveal>

        <MotionReveal preset="viewportReveal">
          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] md:p-7">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Checkout</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Payment details</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Secure Stripe checkout
              </div>
            </div>

            <StatusCard
              onRetry={() => setState({ status: "idle", error: "" })}
              state={wasPaymentCancelled ? "failed" : state.status}
            />

            <form className="mt-6 space-y-5" onSubmit={handlePayment}>
              <Field
                icon={CreditCard}
                label="Card Number"
                name="cardNumber"
                onChange={handleChange}
                placeholder="4242 4242 4242 4242"
                value={values.cardNumber}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  icon={CalendarDays}
                  label="Expiry"
                  name="expiry"
                  onChange={handleChange}
                  placeholder="MM/YY"
                  value={values.expiry}
                />
                <Field
                  icon={ShieldCheck}
                  label="CVC"
                  name="cvc"
                  onChange={handleChange}
                  placeholder="123"
                  value={values.cvc}
                />
              </div>

              <Field
                icon={UserRound}
                label="Name on Card"
                name="nameOnCard"
                onChange={handleChange}
                placeholder="Jane Doe"
                value={values.nameOnCard}
              />

              <Field
                icon={Mail}
                label="Billing Email"
                name="billingEmail"
                onChange={handleChange}
                placeholder="jane@example.com"
                type="email"
                value={values.billingEmail}
              />

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-500">Premium total</span>
                  <span className="text-lg font-semibold text-slate-950">$5.00</span>
                </div>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Card details are entered securely on Stripe after you continue. This page only prepares your hosted checkout session.
                </p>
                {state.error || wasPaymentCancelled ? (
                  <p className="mt-3 text-xs leading-6 text-rose-600">{state.error || cancelledMessage}</p>
                ) : null}
              </div>

              <Button isLoading={state.status === "processing"} size="lg" type="submit">
                Pay $5
              </Button>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: ShieldCheck, label: "Encrypted checkout" },
                  { icon: Lock, label: "Stripe handles cards" },
                  { icon: RotateCcw, label: "Retry friendly" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-xs font-medium text-slate-500">
                    <item.icon className="mx-auto h-4 w-4 text-primary" />
                    <p className="mt-2">{item.label}</p>
                  </div>
                ))}
              </div>
            </form>
          </section>
        </MotionReveal>
      </div>
    </PageContainer>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <PageContainer className="py-12" size="lg">
          <LoadingSpinner className="min-h-[40vh]" label="Loading checkout" />
        </PageContainer>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
