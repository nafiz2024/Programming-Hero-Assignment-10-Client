"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Eye, Flag, Search, ShieldAlert, Trash2, XCircle } from "lucide-react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Pagination from "@/components/ui/Pagination";
import TableSkeleton from "@/components/ui/TableSkeleton";
import UserAvatar from "@/components/ui/UserAvatar";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { adminApi } from "@/lib/api";
import {
  adminReportStatuses,
  buildAdminSummaryCards,
  filterAdminReports,
  getStatusBadgeClass,
  normalizeAdminReports,
  normalizeAdminStats,
  paginateItems,
} from "@/lib/admin";
import { toastError, toastSuccess } from "@/lib/toast";

const PAGE_SIZE = 10;

function SummaryCard({ accent, label, trend, trendTone, value }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>
          <Flag className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-[2rem] font-semibold tracking-[-0.04em] text-slate-950">{value}</p>
          <p className={`mt-1 text-xs ${trendTone}`}>{trend} vs last 7 days</p>
        </div>
      </div>
    </div>
  );
}

function ReportActionMenu({ isOpen, onClose, onDismiss, onRemove, onWarn, promptHref }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute right-0 top-12 z-30 w-48 rounded-[20px] border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
      <Link
        className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
        href={promptHref}
        onClick={onClose}
      >
        <Eye className="h-4 w-4" />
        View Prompt
      </Link>
      <button
        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50"
        onClick={onRemove}
        type="button"
      >
        <Trash2 className="h-4 w-4" />
        Remove Prompt
      </button>
      <button
        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-amber-600 transition hover:bg-amber-50"
        onClick={onWarn}
        type="button"
      >
        <ShieldAlert className="h-4 w-4" />
        Warn Creator
      </button>
      <button
        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-emerald-600 transition hover:bg-emerald-50"
        onClick={onDismiss}
        type="button"
      >
        <XCircle className="h-4 w-4" />
        Dismiss / Not Harmful
      </button>
    </div>
  );
}

export default function AdminReports() {
  const { authLoading, canLoadAdminData, isAdmin } = useAdminAccess();
  const [state, setState] = useState({
    status: "loading",
    error: "",
    reports: [],
    stats: null,
  });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(adminReportStatuses[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState("");
  const [warningTarget, setWarningTarget] = useState(null);
  const [warningForm, setWarningForm] = useState({
    title: "",
    message: "",
  });
  const [removeTarget, setRemoveTarget] = useState(null);
  const [actionState, setActionState] = useState({
    warn: false,
    remove: false,
    dismiss: "",
  });

  async function loadReports() {
    setState((current) => ({
      ...current,
      status: current.reports.length > 0 ? "refreshing" : "loading",
      error: "",
    }));

    try {
      const [reportsResponse, statsResponse] = await Promise.all([
        adminApi.getReports(),
        adminApi.getStats(),
      ]);
      const reports = normalizeAdminReports(reportsResponse);
      setState({
        status: "success",
        error: "",
        reports,
        stats: normalizeAdminStats(statsResponse, reports),
      });
    } catch (error) {
      setState({
        status: "error",
        error: error.message || "Unable to load reported prompts.",
        reports: [],
        stats: null,
      });
    }
  }

  useEffect(() => {
    if (!canLoadAdminData) {
      return;
    }

    const timer = window.setTimeout(() => {
      loadReports();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [canLoadAdminData]);

  const filteredReports = useMemo(
    () => filterAdminReports(state.reports, { query, status: statusFilter }),
    [query, state.reports, statusFilter],
  );
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginatedReports = paginateItems(filteredReports, page, PAGE_SIZE);
  const summaryCards = buildAdminSummaryCards(
    state.stats || normalizeAdminStats({}, state.reports),
  );

  async function handleWarnCreator() {
    if (!warningTarget) {
      return;
    }

    if (!warningForm.title.trim() || !warningForm.message.trim()) {
      toastError("Please provide a warning title and message.");
      return;
    }

    setActionState((current) => ({ ...current, warn: true }));

    try {
      await adminApi.warnCreator(warningTarget.id, {
        title: warningForm.title.trim(),
        message: warningForm.message.trim(),
      });
      toastSuccess("Creator warning sent");
      setWarningTarget(null);
      setWarningForm({ title: "", message: "" });
      await loadReports();
    } catch (error) {
      toastError(error.message || "Unable to send the warning.");
    } finally {
      setActionState((current) => ({ ...current, warn: false }));
    }
  }

  async function handleRemovePrompt() {
    if (!removeTarget) {
      return;
    }

    setActionState((current) => ({ ...current, remove: true }));

    try {
      await adminApi.removePrompt(removeTarget.id, {});
      toastSuccess("Prompt removed successfully");
      setRemoveTarget(null);
      await loadReports();
    } catch (error) {
      toastError(error.message || "Unable to remove this prompt.");
    } finally {
      setActionState((current) => ({ ...current, remove: false }));
    }
  }

  async function handleDismissReport(reportId) {
    setActionState((current) => ({ ...current, dismiss: reportId }));

    try {
      await adminApi.dismissReport(reportId, {});
      toastSuccess("Report dismissed successfully");
      await loadReports();
    } catch (error) {
      toastError(error.message || "Unable to dismiss this report.");
    } finally {
      setActionState((current) => ({ ...current, dismiss: "" }));
    }
  }

  function openWarningModal(report) {
    setWarningTarget(report);
    setWarningForm({
      title: report.warningTitle,
      message: report.warningMessage.replace("{{creator_name}}", report.creatorName),
    });
    setActiveMenuId("");
  }

  if (authLoading) {
    return <TableSkeleton columns={8} rows={8} />;
  }

  if (!isAdmin) {
    return null;
  }

  if (state.status === "loading") {
    return <TableSkeleton columns={8} rows={8} />;
  }

  if (state.status === "error") {
    return (
      <ErrorState
        description={state.error}
        onRetry={loadReports}
        title="Unable to load reported prompts"
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-[2rem] font-semibold tracking-[-0.04em] text-slate-950 md:text-[2.35rem]">
            Reported Prompts
          </h1>
          <p className="mt-2 text-base text-slate-500">
            Review and take action on reported prompts.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <SummaryCard key={card.id} {...card} />
          ))}
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 md:min-w-[420px]">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by prompt title or keywords..."
                type="text"
                value={query}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <Flag className="h-4 w-4 text-slate-400" />
                <span>Filters</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>

              <select
                className="min-h-[52px] rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                value={statusFilter}
              >
                {adminReportStatuses.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="p-6">
              <EmptyState
                description="There are no reports matching the current filters."
                onAction={() => {
                  setQuery("");
                  setStatusFilter(adminReportStatuses[0]);
                }}
                title="No reported prompts found"
              />
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                      <th className="px-5 py-4">Prompt</th>
                      <th className="px-4 py-4">Report Reason</th>
                      <th className="px-4 py-4">Reported By</th>
                      <th className="px-4 py-4">Creator</th>
                      <th className="px-4 py-4">Description</th>
                      <th className="px-4 py-4">Report Date</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReports.map((report) => (
                      <tr key={report.id} className="border-b border-slate-100 align-top">
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className={`flex h-14 w-14 shrink-0 items-end rounded-2xl bg-gradient-to-br ${report.promptAccent} p-2`}>
                              <span className="line-clamp-2 text-[10px] font-semibold text-white">
                                {report.promptTitle}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900">{report.promptTitle}</p>
                              <span className="mt-1 inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600">
                                {report.promptCategory}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-500">
                            {report.reason}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              alt={report.reportedByName}
                              className="h-10 w-10 bg-slate-100 text-xs text-slate-700"
                              fallback={report.reportedByName.slice(0, 2).toUpperCase()}
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900">{report.reportedByName}</p>
                              <p className="truncate text-xs text-slate-500">{report.reportedByEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              alt={report.creatorName}
                              className="h-10 w-10 bg-slate-100 text-xs text-slate-700"
                              fallback={report.creatorName.slice(0, 2).toUpperCase()}
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900">{report.creatorName}</p>
                              <p className="truncate text-xs text-slate-500">{report.creatorEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="line-clamp-2 max-w-[280px] text-sm text-slate-600">{report.description}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(report.reportDate))}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(report.status)}`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="relative flex justify-end">
                            <button
                              className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 text-sm font-medium text-primary transition hover:bg-primary/10"
                              onClick={() => setActiveMenuId((current) => (current === report.id ? "" : report.id))}
                              type="button"
                            >
                              Actions
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            <ReportActionMenu
                              isOpen={activeMenuId === report.id}
                              onClose={() => setActiveMenuId("")}
                              onDismiss={() => {
                                setActiveMenuId("");
                                handleDismissReport(report.id);
                              }}
                              onRemove={() => {
                                setActiveMenuId("");
                                setRemoveTarget(report);
                              }}
                              onWarn={() => openWarningModal(report)}
                              promptHref={report.promptId ? `/prompts/${report.promptId}` : "/prompts"}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 p-5 lg:hidden">
                {paginatedReports.map((report) => (
                  <div key={report.id} className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{report.promptTitle}</p>
                        <span className="mt-2 inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600">
                          {report.promptCategory}
                        </span>
                      </div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{report.reason}</p>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-500">{report.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button as={Link} href={report.promptId ? `/prompts/${report.promptId}` : "/prompts"} size="sm" variant="secondary">
                        View Prompt
                      </Button>
                      <Button onPress={() => openWarningModal(report)} size="sm" variant="secondary">
                        Warn Creator
                      </Button>
                      <Button onPress={() => setRemoveTarget(report)} size="sm" variant="danger">
                        Remove Prompt
                      </Button>
                      <Button
                        isLoading={actionState.dismiss === report.id}
                        onPress={() => handleDismissReport(report.id)}
                        size="sm"
                        variant="secondary"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-slate-500">
                  Showing {filteredReports.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{" "}
                  {Math.min(page * PAGE_SIZE, filteredReports.length)} of {filteredReports.length} reports
                </p>
                <Pagination currentPage={page} onPageChange={setCurrentPage} totalPages={totalPages} />
              </div>
            </>
          )}
        </section>
      </div>

      {warningTarget ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_36px_120px_rgba(15,23,42,0.18)]">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-slate-950">Warn Creator</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Send a moderation warning to {warningTarget.creatorName}.
                </p>
              </div>
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                onClick={() => setWarningTarget(null)}
                type="button"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Warning Title</span>
                <input
                  className="min-h-[52px] w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-primary/40"
                  onChange={(event) => setWarningForm((current) => ({ ...current, title: event.target.value }))}
                  value={warningForm.title}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Message</span>
                <textarea
                  className="min-h-[180px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary/40"
                  maxLength={500}
                  onChange={(event) => setWarningForm((current) => ({ ...current, message: event.target.value }))}
                  value={warningForm.message}
                />
              </label>
              <div className="flex justify-end gap-3">
                <Button onPress={() => setWarningTarget(null)} variant="secondary">
                  Cancel
                </Button>
                <Button isLoading={actionState.warn} onPress={handleWarnCreator}>
                  Send Warning
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {removeTarget ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_36px_120px_rgba(15,23,42,0.18)]">
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950">Remove Prompt?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              This will remove <span className="font-medium text-slate-800">{removeTarget.promptTitle}</span> from the platform.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button onPress={() => setRemoveTarget(null)} variant="secondary">
                Cancel
              </Button>
              <Button isLoading={actionState.remove} onPress={handleRemovePrompt} variant="danger">
                Remove Prompt
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
