"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Copy,
  Eye,
  Flag,
  Search,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Pagination from "@/components/ui/Pagination";
import TableSkeleton from "@/components/ui/TableSkeleton";
import UserAvatar from "@/components/ui/UserAvatar";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { adminApi, promptApi } from "@/lib/api";
import {
  adminPromptStatuses,
  buildAdminPromptStatusCounts,
  filterAdminPrompts,
  getPromptStatusBadgeClass,
  getPromptVisibilityBadgeClass,
  normalizeAdminPrompts,
  paginateItems,
} from "@/lib/admin";
import { toastError, toastSuccess } from "@/lib/toast";

const PAGE_SIZE = 10;

function formatCompactNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function PromptActionMenu({
  isOpen,
  onApprove,
  onDelete,
  onFeature,
  onPreview,
  onReject,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute right-0 top-12 z-30 w-48 rounded-[20px] border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
      <button
        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
        onClick={onPreview}
        type="button"
      >
        <Eye className="h-4 w-4" />
        Preview
      </button>
      <button
        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-emerald-600 transition hover:bg-emerald-50"
        onClick={onApprove}
        type="button"
      >
        <Sparkles className="h-4 w-4" />
        Approve
      </button>
      <button
        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50"
        onClick={onReject}
        type="button"
      >
        <Flag className="h-4 w-4" />
        Reject
      </button>
      <button
        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-violet-600 transition hover:bg-violet-50"
        onClick={onFeature}
        type="button"
      >
        <Star className="h-4 w-4" />
        Feature
      </button>
      <button
        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50"
        onClick={onDelete}
        type="button"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-3 last:border-b-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}

function PromptPreviewDrawer({ onApprove, onClose, onFeature, onReject, prompt }) {
  if (!prompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-slate-950/20 backdrop-blur-[1px]">
      <button
        aria-label="Close preview drawer"
        className="flex-1"
        onClick={onClose}
        type="button"
      />
      <aside className="flex h-full w-full max-w-[440px] flex-col border-l border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950">Prompt Preview</h3>
            <p className="mt-1 text-sm text-slate-500">Moderate the selected submission.</p>
          </div>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-24 rounded-2xl bg-[linear-gradient(135deg,rgba(98,91,246,0.95),rgba(59,130,246,0.82))]" />
            <div className="min-w-0">
              <p className="text-lg font-semibold text-slate-950">{prompt.title}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600">
                  {prompt.category}
                </span>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getPromptStatusBadgeClass(prompt.status)}`}>
                  {prompt.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">Submitted on {prompt.createdLabel}</p>
            </div>
          </div>

          <section className="rounded-[24px] border border-slate-200 p-5">
            <p className="text-sm font-semibold text-slate-900">Overview</p>
            <div className="mt-4">
              <DetailRow label="Category" value={prompt.category} />
              <DetailRow label="AI Tool / Model" value={prompt.aiTool} />
              <DetailRow label="Visibility" value={prompt.visibility} />
              <DetailRow label="Status" value={prompt.status} />
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 p-5">
            <p className="text-sm font-semibold text-slate-900">Prompt Content</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{prompt.description}</p>
            <div className="mt-4 overflow-hidden rounded-[22px] border border-slate-200 bg-slate-950">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  Prompt Content
                </span>
                <Copy className="h-4 w-4 text-slate-500" />
              </div>
              <pre className="max-h-[260px] overflow-auto whitespace-pre-wrap px-4 py-4 font-mono text-[13px] leading-7 text-slate-100">
                {prompt.content}
              </pre>
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 p-5">
            <p className="text-sm font-semibold text-slate-900">Creator Details</p>
            <div className="mt-4 flex items-center gap-3">
              <UserAvatar
                alt={prompt.creatorName}
                className="h-12 w-12 bg-brand-gradient text-sm text-white"
                fallback={prompt.creatorInitials}
                src={prompt.creatorImage}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{prompt.creatorName}</p>
                <p className="truncate text-xs text-slate-500">{prompt.creatorEmail}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total Prompts</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {formatCompactNumber(prompt.creatorPromptCount)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Member Since</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{prompt.creatorJoinedLabel}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 p-5">
            <p className="text-sm font-semibold text-slate-900">Prompt Statistics</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Copies</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{formatCompactNumber(prompt.copyCount)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Bookmarks</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{formatCompactNumber(prompt.bookmarkCount)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Rating</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{prompt.rating.toFixed(1)}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-3 gap-3 border-t border-slate-200 px-6 py-5">
          <Button onPress={onReject} variant="danger">
            Reject
          </Button>
          <Button onPress={onApprove} variant="secondary">
            Approve
          </Button>
          <Button onPress={onFeature}>
            Feature
          </Button>
        </div>
      </aside>
    </div>
  );
}

function RejectModal({
  isSubmitting,
  onClose,
  onDescriptionChange,
  onReasonPick,
  onSubmit,
  prompt,
  value,
}) {
  if (!prompt) {
    return null;
  }

  const commonReasons = [
    "Low quality content",
    "Spam or misleading",
    "Inappropriate content",
    "Plagiarism",
    "Irrelevant or off-topic",
    "Other",
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_36px_120px_rgba(15,23,42,0.18)]">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950">Reject Prompt</h3>
            <p className="mt-2 text-sm text-slate-500">
              Please provide a reason for rejecting <span className="font-medium text-slate-700">{prompt.title}</span>.
            </p>
          </div>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Rejection Feedback</span>
          <textarea
            className="min-h-[160px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary/40"
            maxLength={500}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="Explain why this prompt is being rejected..."
            value={value}
          />
          <div className="mt-2 text-right text-xs text-slate-400">{value.length}/500</div>
        </label>

        <div className="mt-4">
          <p className="text-sm font-medium text-slate-700">Common Reasons</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {commonReasons.map((reason) => (
              <button
                key={reason}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                onClick={() => onReasonPick(reason)}
                type="button"
              >
                {reason}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button onPress={onClose} variant="secondary">
            Cancel
          </Button>
          <Button isLoading={isSubmitting} onPress={onSubmit} variant="danger">
            Reject Prompt
          </Button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ isSubmitting, onClose, onSubmit, prompt }) {
  if (!prompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_36px_120px_rgba(15,23,42,0.18)]">
        <h3 className="text-2xl font-semibold tracking-tight text-slate-950">Delete Prompt?</h3>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          This will permanently remove <span className="font-medium text-slate-800">{prompt.title}</span> from the
          platform.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button onPress={onClose} variant="secondary">
            Cancel
          </Button>
          <Button isLoading={isSubmitting} onPress={onSubmit} variant="danger">
            Delete Prompt
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPrompts() {
  const { authLoading, canLoadAdminData, isAdmin } = useAdminAccess();
  const [state, setState] = useState({
    status: "loading",
    error: "",
    prompts: [],
  });
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    status: adminPromptStatuses[0],
    category: "All Categories",
    aiTool: "All AI Tools",
    visibility: "All Visibility",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [rejectionTarget, setRejectionTarget] = useState(null);
  const [rejectionFeedback, setRejectionFeedback] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionState, setActionState] = useState({
    approve: "",
    reject: false,
    feature: "",
    remove: false,
  });

  async function loadPrompts() {
    setState((current) => ({
      ...current,
      status: current.prompts.length > 0 ? "refreshing" : "loading",
      error: "",
    }));

    try {
      const response = await adminApi.getPrompts();
      setState({
        status: "success",
        error: "",
        prompts: normalizeAdminPrompts(response),
      });
    } catch (error) {
      setState({
        status: "error",
        error: error.message || "Unable to load prompts.",
        prompts: [],
      });
    }
  }

  useEffect(() => {
    if (!canLoadAdminData) {
      return;
    }

    const timer = window.setTimeout(() => {
      loadPrompts();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [canLoadAdminData]);

  const categoryOptions = useMemo(
    () => ["All Categories", ...new Set(state.prompts.map((prompt) => prompt.category))],
    [state.prompts],
  );
  const aiToolOptions = useMemo(
    () => ["All AI Tools", ...new Set(state.prompts.map((prompt) => prompt.aiTool))],
    [state.prompts],
  );
  const statusCounts = useMemo(() => buildAdminPromptStatusCounts(state.prompts), [state.prompts]);
  const filteredPrompts = useMemo(
    () =>
      filterAdminPrompts(state.prompts, {
        query,
        status: filters.status,
        category: filters.category,
        aiTool: filters.aiTool,
        visibility: filters.visibility,
      }),
    [filters, query, state.prompts],
  );
  const totalPages = Math.max(1, Math.ceil(filteredPrompts.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginatedPrompts = paginateItems(filteredPrompts, page, PAGE_SIZE);

  function resetFilters() {
    setQuery("");
    setFilters({
      status: adminPromptStatuses[0],
      category: "All Categories",
      aiTool: "All AI Tools",
      visibility: "All Visibility",
    });
    setCurrentPage(1);
  }

  async function updatePrompt(promptId, payload, successMessage, actionKey) {
    setActionState((current) => ({ ...current, [actionKey]: promptId }));

    try {
      await promptApi.update(promptId, payload);
      toastSuccess(successMessage);
      await loadPrompts();
      setSelectedPrompt((current) =>
        current && current.id === promptId
          ? {
              ...current,
              ...payload,
              status:
                payload.status === "approved"
                  ? "Approved"
                  : payload.status === "rejected"
                  ? "Rejected"
                  : payload.status === "featured"
                  ? "Featured"
                  : current.status,
            }
          : current,
      );
    } catch (error) {
      toastError(error.message || "Unable to update this prompt.");
    } finally {
      setActionState((current) => ({ ...current, [actionKey]: "" }));
    }
  }

  async function handleApprove(prompt) {
    setActiveMenuId("");
    await updatePrompt(prompt.id, { status: "approved" }, "Prompt approved", "approve");
  }

  async function handleFeature(prompt) {
    setActiveMenuId("");
    await updatePrompt(
      prompt.id,
      { status: "featured", featured: true },
      "Prompt featured successfully",
      "feature",
    );
  }

  async function handleRejectSubmit() {
    if (!rejectionTarget) {
      return;
    }

    if (!rejectionFeedback.trim()) {
      toastError("Please provide rejection feedback.");
      return;
    }

    setActionState((current) => ({ ...current, reject: true }));

    try {
      await promptApi.update(rejectionTarget.id, {
        status: "rejected",
        rejectionReason: rejectionFeedback.trim(),
        feedback: rejectionFeedback.trim(),
      });
      toastSuccess("Prompt rejected");
      setRejectionTarget(null);
      setRejectionFeedback("");
      await loadPrompts();
    } catch (error) {
      toastError(error.message || "Unable to reject this prompt.");
    } finally {
      setActionState((current) => ({ ...current, reject: false }));
    }
  }

  async function handleDeletePrompt() {
    if (!deleteTarget) {
      return;
    }

    setActionState((current) => ({ ...current, remove: true }));

    try {
      await promptApi.remove(deleteTarget.id);
      toastSuccess("Prompt deleted successfully");
      setDeleteTarget(null);
      setSelectedPrompt((current) => (current?.id === deleteTarget.id ? null : current));
      await loadPrompts();
    } catch (error) {
      toastError(error.message || "Unable to delete this prompt.");
    } finally {
      setActionState((current) => ({ ...current, remove: false }));
    }
  }

  function openRejectModal(prompt) {
    setActiveMenuId("");
    setRejectionTarget(prompt);
    setRejectionFeedback(prompt.rejectionReason || "");
  }

  if (authLoading) {
    return <TableSkeleton columns={7} rows={8} />;
  }

  if (!isAdmin) {
    return null;
  }

  if (state.status === "loading") {
    return <TableSkeleton columns={7} rows={8} />;
  }

  if (state.status === "error") {
    return (
      <ErrorState
        description={state.error}
        onRetry={loadPrompts}
        title="Unable to load admin prompts"
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-[2rem] font-semibold tracking-[-0.04em] text-slate-950 md:text-[2.35rem]">
            All Prompts
          </h1>
          <p className="mt-2 text-base text-slate-500">
            Manage and moderate all prompts on the platform.
          </p>
        </div>

        <section className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          {statusCounts.Pending > 0 ? (
            <div className="border-b border-amber-200 bg-amber-50/80 px-5 py-4 text-sm text-amber-700">
              {statusCounts.Pending} prompt{statusCounts.Pending === 1 ? "" : "s"} currently pending moderation.
            </div>
          ) : null}
          <div className="border-b border-slate-200 px-5 py-5">
            <div className="flex flex-wrap items-center gap-4">
              {adminPromptStatuses.map((status) => {
                const active = filters.status === status;
                const count = statusCounts[status] ?? 0;

                return (
                  <button
                    key={status}
                    className={`inline-flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition ${
                      active
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                    onClick={() => {
                      setFilters((current) => ({ ...current, status }));
                      setCurrentPage(1);
                    }}
                    type="button"
                  >
                    <span>{status}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        active ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5">
            <div className="grid gap-3 xl:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
              <div className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search prompts by title or keyword..."
                  type="text"
                  value={query}
                />
              </div>

              <select
                className="min-h-[52px] rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                onChange={(event) => {
                  setFilters((current) => ({ ...current, category: event.target.value }));
                  setCurrentPage(1);
                }}
                value={filters.category}
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                className="min-h-[52px] rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                onChange={(event) => {
                  setFilters((current) => ({ ...current, aiTool: event.target.value }));
                  setCurrentPage(1);
                }}
                value={filters.aiTool}
              >
                {aiToolOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                className="min-h-[52px] rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                onChange={(event) => {
                  setFilters((current) => ({ ...current, visibility: event.target.value }));
                  setCurrentPage(1);
                }}
                value={filters.visibility}
              >
                {["All Visibility", "Public", "Private"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <button
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                onClick={resetFilters}
                type="button"
              >
                Filters
              </button>
            </div>
          </div>

          {filteredPrompts.length === 0 ? (
            <div className="p-6">
              <EmptyState
                actionLabel="Reset Filters"
                description="No prompts match the current moderation filters."
                onAction={resetFilters}
                title="No prompts found"
              />
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto xl:block">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                      <th className="px-5 py-4">Prompt</th>
                      <th className="px-4 py-4">Creator</th>
                      <th className="px-4 py-4">Visibility</th>
                      <th className="px-4 py-4">Submitted Date</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Copies</th>
                      <th className="px-4 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPrompts.map((prompt) => (
                      <tr key={prompt.id} className="border-b border-slate-100 align-top">
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="h-14 w-14 shrink-0 rounded-2xl bg-[linear-gradient(135deg,rgba(98,91,246,0.95),rgba(59,130,246,0.82))]" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900">{prompt.title}</p>
                              <span className="mt-1 inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600">
                                {prompt.category}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              alt={prompt.creatorName}
                              className="h-10 w-10 bg-brand-gradient text-xs text-white"
                              fallback={prompt.creatorInitials}
                              src={prompt.creatorImage}
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900">{prompt.creatorName}</p>
                              <p className="truncate text-xs text-slate-500">{prompt.creatorEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getPromptVisibilityBadgeClass(prompt.visibility)}`}>
                            {prompt.visibility}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">{prompt.createdLabel}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getPromptStatusBadgeClass(prompt.status)}`}>
                            {prompt.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-slate-700">
                          {formatCompactNumber(prompt.copyCount)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="relative flex justify-end">
                            <button
                              className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 text-sm font-medium text-primary transition hover:bg-primary/10"
                              onClick={() => setActiveMenuId((current) => (current === prompt.id ? "" : prompt.id))}
                              type="button"
                            >
                              Actions
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            <PromptActionMenu
                              isOpen={activeMenuId === prompt.id}
                              onApprove={() => handleApprove(prompt)}
                              onDelete={() => {
                                setActiveMenuId("");
                                setDeleteTarget(prompt);
                              }}
                              onFeature={() => handleFeature(prompt)}
                              onPreview={() => {
                                setActiveMenuId("");
                                setSelectedPrompt(prompt);
                              }}
                              onReject={() => openRejectModal(prompt)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 p-5 xl:hidden">
                {paginatedPrompts.map((prompt) => (
                  <div key={prompt.id} className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-16 shrink-0 rounded-2xl bg-[linear-gradient(135deg,rgba(98,91,246,0.95),rgba(59,130,246,0.82))]" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{prompt.title}</p>
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${getPromptStatusBadgeClass(prompt.status)}`}>
                            {prompt.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{prompt.creatorName}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-600">
                            {prompt.category}
                          </span>
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${getPromptVisibilityBadgeClass(prompt.visibility)}`}>
                            {prompt.visibility}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Tool</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{prompt.aiTool}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Copies</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{formatCompactNumber(prompt.copyCount)}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Date</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{prompt.createdLabel}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button onPress={() => setSelectedPrompt(prompt)} size="sm" variant="secondary">
                        Preview
                      </Button>
                      <Button
                        isLoading={actionState.approve === prompt.id}
                        onPress={() => handleApprove(prompt)}
                        size="sm"
                        variant="secondary"
                      >
                        Approve
                      </Button>
                      <Button
                        isLoading={actionState.feature === prompt.id}
                        onPress={() => handleFeature(prompt)}
                        size="sm"
                        variant="secondary"
                      >
                        Feature
                      </Button>
                      <Button onPress={() => openRejectModal(prompt)} size="sm" variant="danger">
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-slate-500">
                  Showing {filteredPrompts.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{" "}
                  {Math.min(page * PAGE_SIZE, filteredPrompts.length)} of {filteredPrompts.length} prompts
                </p>
                <Pagination currentPage={page} onPageChange={setCurrentPage} totalPages={totalPages} />
              </div>
            </>
          )}
        </section>
      </div>

      <PromptPreviewDrawer
        onApprove={() => selectedPrompt && handleApprove(selectedPrompt)}
        onClose={() => setSelectedPrompt(null)}
        onFeature={() => selectedPrompt && handleFeature(selectedPrompt)}
        onReject={() => selectedPrompt && openRejectModal(selectedPrompt)}
        prompt={selectedPrompt}
      />

      <RejectModal
        isSubmitting={actionState.reject}
        onClose={() => {
          setRejectionTarget(null);
          setRejectionFeedback("");
        }}
        onDescriptionChange={setRejectionFeedback}
        onReasonPick={(reason) =>
          setRejectionFeedback((current) => (current ? `${current}\n${reason}` : reason))
        }
        onSubmit={handleRejectSubmit}
        prompt={rejectionTarget}
        value={rejectionFeedback}
      />

      <DeleteModal
        isSubmitting={actionState.remove}
        onClose={() => setDeleteTarget(null)}
        onSubmit={handleDeletePrompt}
        prompt={deleteTarget}
      />
    </>
  );
}
