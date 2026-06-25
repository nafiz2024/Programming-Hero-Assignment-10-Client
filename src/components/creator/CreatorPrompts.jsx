"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Eye,
  Globe,
  Lock,
  MoreHorizontal,
  PencilLine,
  Plus,
  Search,
  Star,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import MotionReveal from "@/components/shared/MotionReveal";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Pagination from "@/components/ui/Pagination";
import PromptGridSkeleton from "@/components/ui/PromptGridSkeleton";
import ResponsiveDrawer from "@/components/ui/ResponsiveDrawer";
import { useCreator } from "@/hooks/useCreator";
import { creatorPromptDefaults, creatorPromptFilters, filterCreatorPrompts } from "@/lib/creator";
import { formatCompactNumber } from "@/lib/marketplace";
import { toastError, toastSuccess } from "@/lib/toast";

const PAGE_SIZE = 8;

const statusStyles = {
  approved: "bg-emerald-50 text-emerald-600",
  pending: "bg-amber-50 text-amber-600",
  rejected: "bg-rose-50 text-rose-500",
};

const lightSecondaryButtonClass =
  "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950";

function ActionIconButton({ children, className = "", href, label, onPress }) {
  const sharedClassName = `inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${className}`;

  if (href) {
    return (
      <Link aria-label={label} className={sharedClassName} href={href} title={label}>
        {children}
      </Link>
    );
  }

  return (
    <button
      aria-label={label}
      className={sharedClassName}
      onClick={onPress}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function VisibilityBadge({ prompt }) {
  const isPrivate = prompt.visibilityValue === "private";
  const Icon = isPrivate ? Lock : Globe;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        isPrivate ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-600"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {prompt.visibility}
    </span>
  );
}

function StatusBadge({ prompt }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[prompt.statusValue]}`}>
      {prompt.status}
    </span>
  );
}

function CreatorPromptCard({ onDelete, onEdit, onSelect, prompt, selected }) {
  return (
    <article
      className={`rounded-[24px] border bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition ${
        selected ? "border-primary/35 shadow-[0_20px_50px_rgba(99,102,241,0.16)]" : "border-slate-200"
      }`}
    >
      <div className={`mb-4 h-36 rounded-[20px] bg-gradient-to-br ${prompt.accent}`} />
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-950">{prompt.title}</h3>
            <p className="mt-1 text-sm text-slate-500">Created on {prompt.createdLabel}</p>
          </div>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
            onClick={() => onSelect(prompt)}
            type="button"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600">{prompt.category}</span>
          <VisibilityBadge prompt={prompt} />
          <StatusBadge prompt={prompt} />
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-[20px] border border-slate-200 bg-slate-50/80 p-4 text-center">
          <div>
            <p className="text-lg font-semibold text-slate-950">{formatCompactNumber(prompt.copyCount)}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">Copies</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-950">{formatCompactNumber(prompt.bookmarkCount)}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">Bookmarks</p>
          </div>
          <div>
            <p className="inline-flex items-center gap-1 text-lg font-semibold text-slate-950">
              {prompt.rating.toFixed(1)}
              <Star className="h-4 w-4 fill-current text-amber-400" />
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">Rating</p>
          </div>
        </div>

        {prompt.statusValue === "rejected" && prompt.rejectionReason ? (
          <div className="rounded-[20px] border border-rose-200 bg-rose-50/70 p-4 text-sm text-rose-600">
            <p className="font-semibold">Rejection feedback</p>
            <p className="mt-2 leading-6">{prompt.rejectionReason}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
          <Button
            as={Link}
            className={lightSecondaryButtonClass}
            href={`/prompts/${prompt.id}`}
            size="sm"
            variant="secondary"
          >
            View
          </Button>
        <Button
          className={lightSecondaryButtonClass}
          onPress={() => onEdit(prompt)}
          size="sm"
          variant="secondary"
        >
          Edit
        </Button>
        <Button className="bg-rose-500 text-white hover:bg-rose-600" onPress={() => onDelete(prompt)} size="sm">
          Delete
        </Button>
      </div>
    </article>
  );
}

function AnalyticsSidebar({ prompt }) {
  const topReferrers = [
    { label: "promptflow.com", value: "50.0%" },
    { label: "Google Search", value: "25.0%" },
    { label: "Direct / Bookmark", value: "12.5%" },
    { label: "Social Media", value: "6.3%" },
    { label: "Others", value: "6.3%" },
  ];

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Prompt Analytics</h2>
          <p className="mt-2 text-sm text-slate-500">Snapshot for your selected prompt.</p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${prompt.accent}`} />
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-slate-950">{prompt.title}</p>
          <p className="mt-1 text-sm text-slate-500">Created on {prompt.createdLabel}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        {[
          { label: "Total Copies", value: formatCompactNumber(prompt.copyCount), meta: `+${prompt.performanceChange.toFixed(1)}% vs last 30 days` },
          { label: "Bookmarks", value: formatCompactNumber(prompt.bookmarkCount), meta: `+${Math.max(8.4, prompt.performanceChange - 4).toFixed(1)}% vs last 30 days` },
          { label: "Average Rating", value: `${prompt.rating.toFixed(1)} / 5`, meta: `${prompt.reviewCount} reviews` },
          { label: "Total Views", value: formatCompactNumber(prompt.views), meta: `+${Math.max(12.8, prompt.performanceChange - 1).toFixed(1)}% vs last 30 days` },
        ].map((card) => (
          <div key={card.label} className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{card.value}</p>
            <p className="mt-2 text-sm text-emerald-600">{card.meta}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-950">Top Referrers</h3>
          <Button
            as={Link}
            className={lightSecondaryButtonClass}
            href={`/prompts/${prompt.id}`}
            size="sm"
            variant="secondary"
          >
            View Details
          </Button>
        </div>
        <div className="space-y-4">
          {topReferrers.map((referrer, index) => (
            <div key={referrer.label}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-700">{referrer.label}</span>
                <span className="text-slate-400">{referrer.value}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-brand-gradient"
                  style={{ width: `${Math.max(14, 100 - index * 18)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CreatorPrompts() {
  const { deletePrompt, error, prompts, refreshCreator, status, updatePrompt } = useCreator();
  const [filters, setFilters] = useState({
    search: "",
    category: creatorPromptFilters.categories[0],
    visibility: creatorPromptFilters.visibility[0],
    status: creatorPromptFilters.status[0],
  });
  const [page, setPage] = useState(1);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editForm, setEditForm] = useState(creatorPromptDefaults);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredPrompts = filterCreatorPrompts(prompts, filters);
  const totalPages = Math.max(1, Math.ceil(filteredPrompts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedPrompts = filteredPrompts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const activePrompt =
    filteredPrompts.find((prompt) => prompt.id === selectedPrompt?.id) || paginatedPrompts[0] || prompts[0] || null;

  function openEdit(prompt) {
    setEditingPrompt(prompt);
    setEditForm({
      title: prompt.title,
      description: prompt.description,
      category: prompt.category,
      aiTool: prompt.aiTool,
      tagsText: prompt.tagsText,
      difficulty: prompt.difficulty,
      visibility: prompt.visibilityValue,
      thumbnail: prompt.thumbnail,
      content: prompt.content,
    });
  }

  async function handleSaveEdit() {
    if (!editingPrompt) {
      return;
    }

    if (!editForm.title.trim() || !editForm.description.trim() || !editForm.content.trim()) {
      toastError("Title, description, and prompt content are required.");
      return;
    }

    setIsSaving(true);

    try {
      await updatePrompt(editingPrompt.id, editForm, editingPrompt);
      toastSuccess("Prompt updated successfully");
      setEditingPrompt(null);
      refreshCreator();
    } catch (error) {
      toastError(error.message || "Unable to update this prompt.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeletePrompt() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      await deletePrompt(deleteTarget.id);
      toastSuccess("Prompt deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      toastError(error.message || "Unable to delete this prompt.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (status === "loading") {
    return <PromptGridSkeleton count={6} />;
  }

  if (status === "error") {
    return <ErrorState description={error} onRetry={refreshCreator} title="Unable to load creator prompts" />;
  }

  return (
    <>
      <div className="space-y-6">
        <DashboardPageHeader
          crumbs={["Creator", "My Prompts"]}
          description="Manage and track all your prompts in one place."
          title="My Prompts"
        />

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
          <MotionReveal preset="viewportReveal">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="grid gap-3 md:grid-cols-2 xl:min-w-[620px] xl:grid-cols-[1.3fr_0.8fr_0.8fr]">
                  <div className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                      onChange={(event) => {
                        setFilters((current) => ({ ...current, search: event.target.value }));
                        setPage(1);
                      }}
                      placeholder="Search prompts..."
                      type="text"
                      value={filters.search}
                    />
                  </div>

                  {[
                    { key: "category", options: creatorPromptFilters.categories },
                    { key: "visibility", options: creatorPromptFilters.visibility },
                    { key: "status", options: creatorPromptFilters.status },
                  ].map((filter) => (
                    <select
                      key={filter.key}
                      className="min-h-[52px] rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                      onChange={(event) => {
                        setFilters((current) => ({ ...current, [filter.key]: event.target.value }));
                        setPage(1);
                      }}
                      value={filters[filter.key]}
                    >
                      {filter.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>

                <Button
                  as={Link}
                  className="shrink-0 whitespace-nowrap px-5"
                  href="/creator/prompts/new"
                >
                  <Plus className="h-4 w-4" />
                  Add New Prompt
                </Button>
              </div>

              <div className="mt-6">
                {filteredPrompts.length === 0 ? (
                  <EmptyState
                    actionLabel="Create Prompt"
                    description="No prompts matched your search or filters. Try adjusting the filters or add a new creator prompt."
                    onAction={() => window.location.assign("/creator/prompts/new")}
                    title="No prompts found"
                  />
                ) : (
                  <>
                    <div className="hidden overflow-hidden rounded-[24px] border border-slate-200 xl:block">
                      <div className="grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_0.7fr_0.8fr_0.9fr] gap-4 bg-slate-50/90 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        <span>Prompt</span>
                        <span>Category</span>
                        <span>Visibility</span>
                        <span>Status</span>
                        <span>Copies</span>
                        <span>Rating</span>
                        <span>Actions</span>
                      </div>
                      {paginatedPrompts.map((prompt) => (
                        <div
                          key={prompt.id}
                          className={`grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_0.7fr_0.8fr_0.9fr] gap-4 border-t border-slate-100 px-6 py-5 ${
                            activePrompt?.id === prompt.id ? "bg-primary/[0.03]" : "bg-white"
                          }`}
                        >
                          <button className="flex items-center gap-4 text-left" onClick={() => setSelectedPrompt(prompt)} type="button">
                            <div className={`h-14 w-16 shrink-0 rounded-2xl bg-gradient-to-br ${prompt.accent}`} />
                            <div className="min-w-0">
                              <p className="truncate text-base font-semibold text-slate-950">{prompt.title}</p>
                              <p className="mt-1 text-sm text-slate-500">Created on {prompt.createdLabel}</p>
                            </div>
                          </button>
                          <span className="my-auto w-fit rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600">{prompt.category}</span>
                          <div className="my-auto">
                            <VisibilityBadge prompt={prompt} />
                          </div>
                          <div className="my-auto">
                            <StatusBadge prompt={prompt} />
                          </div>
                          <p className="my-auto text-sm font-medium text-slate-600">{formatCompactNumber(prompt.copyCount)}</p>
                          <p className="my-auto inline-flex items-center gap-1 text-sm font-medium text-slate-600">
                            {prompt.rating.toFixed(1)}
                            <Star className="h-4 w-4 fill-current text-amber-400" />
                          </p>
                          <div className="my-auto flex items-center gap-2">
                            <ActionIconButton
                              className="border-sky-200 bg-sky-50 text-sky-600 hover:border-sky-300 hover:bg-sky-100 hover:text-sky-700"
                              href={`/prompts/${prompt.id}`}
                              label={`View ${prompt.title}`}
                            >
                              <Eye className="h-4 w-4" />
                            </ActionIconButton>
                            <ActionIconButton
                              className="border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                              label={`Edit ${prompt.title}`}
                              onPress={() => openEdit(prompt)}
                            >
                              <PencilLine className="h-4 w-4" />
                            </ActionIconButton>
                            <ActionIconButton
                              className="border-rose-200 bg-rose-50 text-rose-600 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700"
                              label={`Delete ${prompt.title}`}
                              onPress={() => setDeleteTarget(prompt)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </ActionIconButton>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-4 xl:hidden">
                      {paginatedPrompts.map((prompt) => (
                        <CreatorPromptCard
                          key={prompt.id}
                          onDelete={setDeleteTarget}
                          onEdit={openEdit}
                          onSelect={setSelectedPrompt}
                          prompt={prompt}
                          selected={activePrompt?.id === prompt.id}
                        />
                      ))}
                    </div>

                    <div className="mt-6">
                      <Pagination currentPage={currentPage} onPageChange={setPage} totalPages={totalPages} />
                    </div>
                  </>
                )}
              </div>
            </section>
          </MotionReveal>

          {activePrompt ? (
            <MotionReveal preset="viewportReveal">
              <AnalyticsSidebar prompt={activePrompt} />
            </MotionReveal>
          ) : null}
        </div>
      </div>

      <ResponsiveDrawer isOpen={Boolean(editingPrompt)} onClose={() => setEditingPrompt(null)} title="Edit Prompt">
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Prompt Title</span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))}
              value={editForm.title}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea
              className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))}
              value={editForm.description}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Category</span>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                onChange={(event) => setEditForm((current) => ({ ...current, category: event.target.value }))}
                value={editForm.category}
              >
                {creatorPromptFilters.categories.slice(1).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Visibility</span>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                onChange={(event) => setEditForm((current) => ({ ...current, visibility: event.target.value }))}
                value={editForm.visibility}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Prompt Content</span>
            <textarea
              className="min-h-[180px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              onChange={(event) => setEditForm((current) => ({ ...current, content: event.target.value }))}
              value={editForm.content}
            />
          </label>

          {editingPrompt?.statusValue === "rejected" && editingPrompt.rejectionReason ? (
            <div className="rounded-[20px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
              <div className="flex items-center gap-2 font-semibold">
                <TriangleAlert className="h-4 w-4" />
                Moderator feedback
              </div>
              <p className="mt-2 leading-6">{editingPrompt.rejectionReason}</p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button className={lightSecondaryButtonClass} onPress={() => setEditingPrompt(null)} variant="secondary">
              Cancel
            </Button>
            <Button isLoading={isSaving} onPress={handleSaveEdit}>
              Save Changes
            </Button>
          </div>
        </div>
      </ResponsiveDrawer>

      {deleteTarget ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_36px_120px_rgba(15,23,42,0.18)]">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-500">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950">Delete this prompt?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              This action will remove <span className="font-semibold text-slate-900">{deleteTarget.title}</span> from your creator library.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button className={lightSecondaryButtonClass} onPress={() => setDeleteTarget(null)} variant="secondary">
                Cancel
              </Button>
              <Button className="bg-rose-500 text-white hover:bg-rose-600" isLoading={isDeleting} onPress={handleDeletePrompt}>
                Delete Prompt
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
