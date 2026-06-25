"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, DollarSign, Receipt, Wallet } from "lucide-react";

import ErrorState from "@/components/ui/ErrorState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { adminApi } from "@/lib/api";
import { formatCompactNumber } from "@/lib/marketplace";
import { normalizePayments } from "@/lib/payments";

function formatCurrency(value, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function isSuccessfulStatus(status) {
  return ["paid", "completed", "succeeded"].includes(String(status || "").toLowerCase());
}

function getStatusBadgeClass(status) {
  const normalized = String(status || "").toLowerCase();

  if (normalized.includes("paid") || normalized.includes("complete") || normalized.includes("succeed")) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (normalized.includes("pending")) {
    return "bg-amber-50 text-amber-700";
  }

  if (normalized.includes("refund")) {
    return "bg-sky-50 text-sky-700";
  }

  return "bg-rose-50 text-rose-700";
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyPaymentsState() {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-slate-400 shadow-sm">
        <Receipt className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-slate-950">No payment records yet</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Completed premium payments will appear here automatically once records exist in the database.
      </p>
    </div>
  );
}

function PaymentRow({ payment }) {
  const customerLabel = payment.userName || "PromptFlow user";
  const customerEmail = payment.userEmail || "Email unavailable";

  return (
    <tr className="border-t border-slate-100 align-top">
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-slate-950">{payment.transactionId}</p>
        <p className="mt-1 text-xs text-slate-500">{payment.createdLabel}</p>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-slate-950">{customerLabel}</p>
        <p className="mt-1 text-xs text-slate-500">{customerEmail}</p>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-slate-950">{formatCurrency(payment.amount, payment.currency)}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{payment.currency}</p>
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(payment.statusValue)}`}>
          {payment.status}
        </span>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-slate-950">{payment.createdLabel}</p>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-semibold capitalize text-slate-950">{String(payment.planName || payment.plan || "premium").replace(/[-_]/g, " ")}</p>
        <p className="mt-1 text-xs text-slate-500">{payment.plan || "premium"}</p>
      </td>
    </tr>
  );
}

export default function AdminPayments() {
  const [state, setState] = useState({
    status: "loading",
    error: "",
    payments: [],
  });

  async function loadPayments() {
    setState((current) => ({
      ...current,
      status: current.payments.length > 0 ? "refreshing" : "loading",
      error: "",
    }));

    try {
      const response = await adminApi.getPayments();
      const payments = normalizePayments(response).sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      );

      setState({
        status: "success",
        error: "",
        payments,
      });
    } catch (error) {
      setState({
        status: "error",
        error: error.message || "Unable to load admin payments.",
        payments: [],
      });
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadPayments();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const summary = useMemo(() => {
    const successfulPayments = state.payments.filter((payment) => isSuccessfulStatus(payment.statusValue));
    const totalRevenue = successfulPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const premiumPayments = successfulPayments.filter((payment) =>
      String(payment.plan || payment.planName || "").toLowerCase().includes("premium"),
    ).length;

    return {
      totalPayments: successfulPayments.length,
      totalRevenue,
      premiumPayments,
    };
  }, [state.payments]);

  if (state.status === "loading") {
    return <LoadingSpinner className="min-h-[50vh]" label="Loading admin payments" />;
  }

  if (state.status === "error") {
    return (
      <ErrorState
        description={state.error}
        onRetry={loadPayments}
        title="Unable to load admin payments"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[2rem] font-semibold tracking-[-0.04em] text-slate-950 md:text-[2.35rem]">
          Payments
        </h1>
        <p className="mt-2 text-base text-slate-500">
          Review premium transactions, customer details, and payment status in one place.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={Wallet}
          label="Successful Payments"
          tone="bg-emerald-50 text-emerald-600"
          value={formatCompactNumber(summary.totalPayments)}
        />
        <SummaryCard
          icon={DollarSign}
          label="Total Revenue"
          tone="bg-sky-50 text-sky-600"
          value={formatCurrency(summary.totalRevenue)}
        />
        <SummaryCard
          icon={CreditCard}
          label="Premium Plan Payments"
          tone="bg-violet-50 text-violet-600"
          value={formatCompactNumber(summary.premiumPayments)}
        />
      </section>

      {state.payments.length === 0 ? (
        <EmptyPaymentsState />
      ) : (
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="border-b border-slate-100 px-5 py-5">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">Payment Records</h2>
            <p className="mt-1 text-sm text-slate-500">
              Latest admin-visible payment records synced from completed premium transactions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50/90">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Transaction</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Amount</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Payment Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Plan</th>
                </tr>
              </thead>
              <tbody>
                {state.payments.map((payment) => (
                  <PaymentRow key={payment.id} payment={payment} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
