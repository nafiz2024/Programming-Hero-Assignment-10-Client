"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, Search, Trash2 } from "lucide-react";

import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import MotionReveal from "@/components/shared/MotionReveal";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Pagination from "@/components/ui/Pagination";
import PromptGridSkeleton from "@/components/ui/PromptGridSkeleton";
import { useDashboard } from "@/hooks/useDashboard";
import { formatDashboardDate } from "@/lib/dashboard";
import { bookmarkApi } from "@/lib/api";
import { toastError, toastSuccess } from "@/lib/toast";

const PAGE_SIZE = 8;

function SavedPromptCard({ bookmark, onRemove }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
      <div className={`mb-4 h-36 rounded-[20px] bg-gradient-to-br ${bookmark.accent}`} />
      <div className="space-y-3">
        <h3 className="text-2xl font-semibold tracking-tight text-slate-950">{bookmark.title}</h3>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">{bookmark.aiTool}</span>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600">{bookmark.category}</span>
        </div>
        <p className="text-sm text-slate-600">By {bookmark.author}</p>
        <p className="text-sm text-slate-500">Saved on {formatDashboardDate(bookmark.savedAt)}</p>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <Button as={Link} className="flex-1 border border-slate-200 bg-white text-primary hover:bg-slate-50" href={`/prompts/${bookmark.id}`} variant="secondary">
          View Details
        </Button>
        <button
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-500 transition hover:bg-rose-100"
          onClick={onRemove}
          type="button"
        >
          <Bookmark className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function DashboardSaved() {
  const { bookmarks, error, refreshDashboard, status } = useDashboard();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [pendingRemoval, setPendingRemoval] = useState(null);
  const [localBookmarks, setLocalBookmarks] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const visibleBookmarks = localBookmarks || bookmarks;
  const filteredBookmarks = visibleBookmarks.filter((bookmark) =>
    [bookmark.title, bookmark.author, bookmark.category, bookmark.aiTool].join(" ").toLowerCase().includes(query.trim().toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filteredBookmarks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedBookmarks = filteredBookmarks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  async function handleRemoveBookmark() {
    if (!pendingRemoval) {
      return;
    }

    setIsRemoving(true);

    try {
      await bookmarkApi.remove(pendingRemoval.id);
      const nextBookmarks = visibleBookmarks.filter((bookmark) => bookmark.id !== pendingRemoval.id);
      setLocalBookmarks(nextBookmarks);
      setPendingRemoval(null);
      toastSuccess("Saved prompt removed");
      refreshDashboard();
    } catch (error) {
      toastError(error.message || "Unable to remove saved prompt.");
    } finally {
      setIsRemoving(false);
    }
  }

  if (status === "loading") {
    return <PromptGridSkeleton count={6} />;
  }

  if (status === "error") {
    return <ErrorState description={error} onRetry={refreshDashboard} title="Unable to load saved prompts" />;
  }

  return (
    <>
      <div className="space-y-6">
        <DashboardPageHeader crumbs={["Dashboard", "Saved Prompts"]} description="All the prompts you've saved for later." title="Saved Prompts" />

        <MotionReveal preset="viewportReveal">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-lg font-semibold text-slate-900">Total Saved: {filteredBookmarks.length}</p>
              <div className="flex items-center gap-3">
                <div className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 lg:min-w-[320px]">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search saved prompts..."
                    type="text"
                    value={query}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              {filteredBookmarks.length === 0 ? (
                <EmptyState
                  actionLabel="Browse Marketplace"
                  description="Your saved list is empty right now. Explore prompts and bookmark the ones you want to revisit."
                  onAction={() => window.location.assign("/prompts")}
                  title="No saved prompts found"
                />
              ) : (
                <>
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {paginatedBookmarks.map((bookmark) => (
                      <SavedPromptCard bookmark={bookmark} key={bookmark.bookmarkId || bookmark.id} onRemove={() => setPendingRemoval(bookmark)} />
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
      </div>

      {pendingRemoval ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_36px_120px_rgba(15,23,42,0.18)]">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-500">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950">Remove Saved Prompt?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Are you sure you want to remove this prompt from your saved list? You can always bookmark it again later.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                onPress={() => setPendingRemoval(null)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button isLoading={isRemoving} onPress={handleRemoveBookmark} variant="danger">
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
