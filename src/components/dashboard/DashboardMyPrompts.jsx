"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Eye, Globe, Lock, MoreHorizontal, PencilLine, Search, Star, Trash2, TriangleAlert } from "lucide-react";

import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import MotionReveal from "@/components/shared/MotionReveal";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Pagination from "@/components/ui/Pagination";
import PromptGridSkeleton from "@/components/ui/PromptGridSkeleton";
import ResponsiveDrawer from "@/components/ui/ResponsiveDrawer";
import { useDashboard } from "@/hooks/useDashboard";
import { creatorPromptDefaults, creatorPromptFilters, filterCreatorPrompts } from "@/lib/creator";
import { formatCompactNumber } from "@/lib/marketplace";
import { toastError, toastSuccess } from "@/lib/toast";

const PAGE_SIZE = 5;

const statusStyles = {
  approved: "bg-emerald-50 text-emerald-600",
  pending: "bg-amber-50 text-amber-600",
  rejected: "bg-rose-50 text-rose-500",
};

function VisibilityBadge({ prompt }) {
  const isPrivate = prompt.visibilityValue === "private";
  const Icon = isPrivate ? Lock : Globe;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${isPrivate ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"}`}>
      <Icon className="h-3.5 w-3.5" />
      {prompt.visibility}
    </span>
  );
}

function StatusBadge({ prompt }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[prompt.statusValue]}`}>{prompt.status}</span>;
}

function MobilePromptCard({ onDelete, onEdit, prompt }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)]"
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`h-16 w-20 rounded-[20px] bg-gradient-to-br ${prompt.accent}`} />
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-slate-950">{prompt.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{prompt.description}</p>
          </div>
        </div>
        <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500" type="button">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600">{prompt.category}</span>
        <StatusBadge prompt={prompt} />
        <VisibilityBadge prompt={prompt} />
      </div>

      {prompt.statusValue === "rejected" && prompt.rejectionReason ? (
        <div className="mt-4 rounded-[20px] border border-rose-200 bg-rose-50/70 p-4 text-sm text-rose-600">
          <p className="font-semibold">Rejection feedback</p>
          <p className="mt-2 leading-6">{prompt.rejectionReason}</p>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-3 gap-3 rounded-[20px] border border-slate-200 bg-slate-50/80 p-4 text-center">
        <div>
          <p className="text-sm font-semibold text-slate-950">{formatCompactNumber(prompt.copyCount)}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">Copies</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">{prompt.createdLabel}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">Date</p>
        </div>
        <div>
          <p className="inline-flex items-center gap-1 text-sm font-semibold text-slate-950">
            {prompt.rating.toFixed(1)}
            <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">Rating</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Button as={Link} href={`/prompts/${prompt.id}`} size="sm" variant="secondary">
          View
        </Button>
        <Button onPress={() => onEdit(prompt)} size="sm" variant="secondary">
          Edit
        </Button>
        <Button className="bg-rose-500 text-white hover:bg-rose-600" onPress={() => onDelete(prompt)} size="sm">
          Delete
        </Button>
      </div>
    </motion.article>
  );
}

export default function DashboardMyPrompts() {
  const { deleteOwnedPrompt, error, ownedPrompts, refreshDashboard, status, updateOwnedPrompt } = useDashboard();
  const shouldReduceMotion = useReducedMotion();
  const [filters, setFilters] = useState({
    search: "",
    category: creatorPromptFilters.categories[0],
    visibility: creatorPromptFilters.visibility[0],
    status: creatorPromptFilters.status[0],
  });
  const [page, setPage] = useState(1);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editForm, setEditForm] = useState(creatorPromptDefaults);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredPrompts = filterCreatorPrompts(ownedPrompts, filters);
  const totalPages = Math.max(1, Math.ceil(filteredPrompts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedPrompts = filteredPrompts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
      await updateOwnedPrompt(editingPrompt.id, editForm, editingPrompt);
      toastSuccess("Prompt updated successfully");
      setEditingPrompt(null);
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
      await deleteOwnedPrompt(deleteTarget.id);
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
    return <ErrorState description={error} onRetry={refreshDashboard} title="Unable to load your prompts" />;
  }

  return (
    <>
      <div className="space-y-6">
        <DashboardPageHeader
          crumbs={["Dashboard", "My Prompts"]}
          description="Manage your prompts and track their performance."
          title="My Prompts"
        />

        <MotionReveal preset="viewportReveal">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="grid gap-3 md:grid-cols-2 xl:min-w-[620px] xl:grid-cols-[1.2fr_0.65fr]">
                <div className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    onChange={(event) => {
                      setFilters((current) => ({ ...current, search: event.target.value }));
                      setPage(1);
                    }}
                    placeholder="Search by title or description..."
                    type="text"
                    value={filters.search}
                  />
                </div>

                <select
                  className="min-h-[52px] rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  onChange={(event) => {
                    setFilters((current) => ({ ...current, status: event.target.value }));
                    setPage(1);
                  }}
                  value={filters.status}
                >
                  {creatorPromptFilters.status.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <Button as={Link} href="/dashboard/prompts/new">
                Add New Prompt
              </Button>
            </div>

            <div className="mt-6">
              {filteredPrompts.length === 0 ? (
                <EmptyState
                  actionLabel="Create Prompt"
                  description="You have not submitted any prompts yet. Create a new prompt to start building your prompt library."
                  onAction={() => window.location.assign("/dashboard/prompts/new")}
                  title="No prompts found"
                />
              ) : (
                <>
                  <div className="hidden overflow-hidden rounded-[24px] border border-slate-200 xl:block">
                    <div className="grid grid-cols-[minmax(0,2fr)_0.9fr_0.75fr_0.75fr_0.6fr_0.75fr_0.8fr] gap-4 bg-slate-50/90 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      <span>Prompt</span>
                      <span>AI Tool</span>
                      <span>Visibility</span>
                      <span>Status</span>
                      <span>Copies</span>
                      <span>Date</span>
                      <span>Actions</span>
                    </div>

                    {paginatedPrompts.map((prompt, index) => (
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        className="border-t border-slate-100 bg-white"
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                        key={prompt.id}
                        transition={{ duration: 0.24, delay: shouldReduceMotion ? 0 : index * 0.04, ease: "easeOut" }}
                      >
                        <div className="grid grid-cols-[minmax(0,2fr)_0.9fr_0.75fr_0.75fr_0.6fr_0.75fr_0.8fr] gap-4 px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`h-14 w-16 rounded-2xl bg-gradient-to-br ${prompt.accent}`} />
                            <div className="min-w-0">
                              <p className="truncate text-base font-semibold text-slate-950">{prompt.title}</p>
                              <p className="mt-1 truncate text-sm text-slate-500">{prompt.description}</p>
                            </div>
                          </div>
                          <p className="my-auto text-sm text-slate-600">{prompt.aiTool}</p>
                          <div className="my-auto">
                            <VisibilityBadge prompt={prompt} />
                          </div>
                          <div className="my-auto">
                            <StatusBadge prompt={prompt} />
                          </div>
                          <p className="my-auto text-sm font-medium text-slate-600">{formatCompactNumber(prompt.copyCount)}</p>
                          <p className="my-auto text-sm text-slate-600">{prompt.createdLabel}</p>
                          <div className="my-auto flex items-center gap-2">
                            <Button as={Link} href={`/prompts/${prompt.id}`} size="sm" variant="secondary">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button onPress={() => openEdit(prompt)} size="sm" variant="secondary">
                              <PencilLine className="h-4 w-4" />
                            </Button>
                            <Button className="bg-rose-500 text-white hover:bg-rose-600" onPress={() => setDeleteTarget(prompt)} size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {prompt.statusValue === "rejected" && prompt.rejectionReason ? (
                          <div className="mx-6 mb-5 rounded-[20px] border border-rose-200 bg-rose-50/70 p-4 text-sm text-rose-600">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-semibold">Rejection Feedback</p>
                                <p className="mt-2 leading-6">{prompt.rejectionReason}</p>
                              </div>
                              <div className="text-right text-xs font-medium uppercase tracking-[0.18em] text-rose-400">
                                <p>Rejected</p>
                                <p className="mt-1 normal-case">{prompt.createdLabel}</p>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid gap-4 xl:hidden">
                    {paginatedPrompts.map((prompt) => (
                      <MobilePromptCard key={prompt.id} onDelete={setDeleteTarget} onEdit={openEdit} prompt={prompt} />
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-slate-500">
                      Showing 1 to {paginatedPrompts.length} of {filteredPrompts.length} prompts
                    </p>
                    <Pagination currentPage={currentPage} onPageChange={setPage} totalPages={totalPages} />
                  </div>
                </>
              )}
            </div>
          </section>
        </MotionReveal>
      </div>

      <ResponsiveDrawer isOpen={Boolean(editingPrompt)} onClose={() => setEditingPrompt(null)} title="Update Prompt">
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
                Rejection feedback
              </div>
              <p className="mt-2 leading-6">{editingPrompt.rejectionReason}</p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" onPress={() => setEditingPrompt(null)} variant="secondary">
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
              This action will remove <span className="font-semibold text-slate-900">{deleteTarget.title}</span> from your submissions.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" onPress={() => setDeleteTarget(null)} variant="secondary">
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
