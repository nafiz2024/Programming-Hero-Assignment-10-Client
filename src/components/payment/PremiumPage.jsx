"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { BadgeCheck, CalendarDays, Check, CreditCard, Crown, ShieldCheck } from "lucide-react";

import MotionReveal from "@/components/shared/MotionReveal";
import PageContainer from "@/components/shared/PageContainer";
import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { paymentApi } from "@/lib/api";
import { isPremiumSubscription, normalizePayments, PREMIUM_PLAN } from "@/lib/payments";

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function StatusSummary({ payments, user }) {
  const latestPayment = payments[0] || null;
  const isPremium = isPremiumSubscription(user?.subscription);
  const expiryDate = latestPayment?.expiryDate || null;

  return (
    <section className="overflow-hidden rounded-[30px] border border-primary/18 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.24),transparent_28%),linear-gradient(135deg,#081122_0%,#121b33_55%,#1b2550_100%)] p-6 text-white shadow-[0_26px_90px_rgba(15,23,42,0.24)] md:p-7">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="inline-flex rounded-full border border-white/14 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/82">
            Premium Status
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight">
            {isPremium ? "Premium active" : "Premium not active"}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/74">
            {isPremium
              ? "Your account can access premium prompts, private creator content, and upgraded PromptFlow features."
              : "Upgrade to unlock premium prompts, private creator content, and a smoother PromptFlow workflow."}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:min-w-[330px]">
          <div className="rounded-[24px] border border-white/10 bg-white/8 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/62">Current Plan</p>
            <p className="mt-3 text-2xl font-semibold">{isPremium ? "Premium" : "Free"}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/8 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/62">Expiry Date</p>
            <p className="mt-3 text-2xl font-semibold">{isPremium ? formatDate(expiryDate) : "Upgrade required"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PremiumPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [state, setState] = useState({
    status: "loading",
    error: "",
    payments: [],
  });
  const isPremium = isPremiumSubscription(user?.subscription);
  const paymentSuccess = searchParams.get("payment") === "success";
  const transactionId = searchParams.get("tx") || "";

  useEffect(() => {
    let isMounted = true;

    async function loadPayments() {
      try {
        const response = await paymentApi.getMyPayments();
        const normalized = normalizePayments(response).sort(
          (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
        );

        if (isMounted) {
          setState({
            status: "success",
            error: "",
            payments: normalized,
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            status: "error",
            error: error.message || "Unable to load payment history.",
            payments: [],
          });
        }
      }
    }

    loadPayments();

    return () => {
      isMounted = false;
    };
  }, []);

  const latestPayment = useMemo(() => state.payments[0] || null, [state.payments]);

  if (state.status === "loading") {
    return <LoadingSpinner className="min-h-[50vh]" label="Loading premium status" />;
  }

  return (
    <PageContainer className="space-y-8 py-10 md:py-14" size="xl">
      {paymentSuccess ? (
        <MotionReveal preset="contentFade">
          <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-5 shadow-[0_18px_50px_rgba(16,185,129,0.08)]">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-emerald-700">
                  Premium activated successfully
                </h2>
                <p className="mt-2 text-sm leading-6 text-emerald-700/85">
                  Your PromptFlow premium access is now active and ready to use across locked prompts.
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-emerald-700/70">
                  Transaction ID: {transactionId || latestPayment?.transactionId || "Processing"}
                </p>
              </div>
            </div>
          </div>
        </MotionReveal>
      ) : null}

      <MotionReveal preset="viewportReveal">
        <StatusSummary payments={state.payments} user={user} />
      </MotionReveal>

      {!isPremium ? (
        <MotionReveal preset="viewportReveal">
          <ErrorState
            description="This account does not have premium access yet. Upgrade to unlock private prompts and premium creator content."
            onRetry={null}
            title="Premium not active"
          />
        </MotionReveal>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <MotionReveal preset="viewportReveal">
          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] md:p-7">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Benefits</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Premium benefits</h2>
            </div>
            <div className="space-y-3">
              {PREMIUM_PLAN.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-4 w-4" />
                  </span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">Manage subscription</p>
                  <p className="mt-1 text-sm text-slate-500">UI is ready for future billing management actions.</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button as={Link} href="/pricing" variant="secondary">
                  View Pricing
                </Button>
                <Button as={Link} href="/payment" variant="secondary">
                  Checkout Again
                </Button>
              </div>
            </div>
          </section>
        </MotionReveal>

        <MotionReveal preset="viewportReveal">
          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] md:p-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Billing</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Payment history</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Secure records
              </div>
            </div>

            {state.status === "error" ? (
              <ErrorState description={state.error} onRetry={null} title="Unable to load payment history" />
            ) : state.payments.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-950">No payments yet</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Once premium payments are completed, your transaction history will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {state.payments.map((payment) => (
                  <div key={payment.id} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{payment.planName}</p>
                        <p className="mt-1 text-xs text-slate-500">Transaction ID: {payment.transactionId}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-semibold text-slate-950">${payment.amount.toFixed(2)}</span>
                        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                          {payment.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Paid On</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{payment.createdLabel}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Premium Expiry</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(payment.expiryDate)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">Current premium expiry</p>
                  <p className="mt-2 text-sm text-slate-500">
                    {latestPayment ? formatDate(latestPayment.expiryDate) : "Your expiry date will appear after your first premium payment."}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </MotionReveal>
      </div>
    </PageContainer>
  );
}

export default function PremiumPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="min-h-[50vh]" label="Loading premium status" />}>
      <PremiumPageContent />
    </Suspense>
  );
}
