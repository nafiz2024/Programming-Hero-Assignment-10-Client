"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bookmark, Search, Trash2 } from "lucide-react";

import SavedPromptCard from "@/components/prompts/SavedPromptCard";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import MotionReveal from "@/components/shared/MotionReveal";
import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import Pagination from "@/components/ui/Pagination";
import PromptGridSkeleton from "@/components/ui/PromptGridSkeleton";
import { useSavedPrompts } from "@/hooks/useSavedPrompts";
import {
  filterSavedPrompts,
  paginateSavedPrompts,
  savedPromptSortOptions,
  sortSavedPrompts,
} from "@/lib/saved-prompts";
import { toastError, toastSuccess } from "@/lib/toast";

const PAGE_SIZE = 8;

function SavedPromptsEmptyState({ hasBookmarks = false }) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-[28px] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#625BF6]/10 text-[#625BF6] shadow-[0_18px_40px_rgba(98,91,246,0.18)]">
        <Bookmark className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
          {hasBookmarks ? "No prompts match this search" : "No saved prompts yet"}
        </h3>
        <p className="max-w-md text-base text-slate-500">
          {hasBookmarks ? "Try a different search term or sort option." : "Save prompts to access them later."}
        </p>
      </div>
      {!hasBookmarks ? (
        <Button as={Link} href="/prompts">
          Browse Prompts
        </Button>
      ) : null}
    </div>
  );
}

export default function DashboardSaved() {
  const { error, items, refresh, removeBookmark, status } = useSavedPrompts();
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState(savedPromptSortOptions[0]);
  const [page, setPage] = useState(1);
  const [pendingRemoval, setPendingRemoval] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const filteredBookmarks = useMemo(() => {
    const filtered = filterSavedPrompts(items, query);
    return sortSavedPrompts(filtered, sortBy);
  }, [items, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredBookmarks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedBookmarks = useMemo(
    () => paginateSavedPrompts(filteredBookmarks, currentPage, PAGE_SIZE),
    [currentPage, filteredBookmarks],
  );

  async function handleRemoveBookmark() {
    if (!pendingRemoval) {
      return;
    }

    setIsRemoving(true);

    try {
      await removeBookmark(pendingRemoval.id);
      setPendingRemoval(null);
      toastSuccess("Saved prompt removed");
    } catch (removeError) {
      toastError(removeError.message || "Unable to remove saved prompt.");
    } finally {
      setIsRemoving(false);
    }
  }

  if (status === "loading" || status === "refreshing") {
    return <PromptGridSkeleton count={8} />;
  }

  if (status === "error") {
    return (
      <ErrorState
        description={error || "Unable to load saved prompts."}
        onRetry={refresh}
        title="Unable to load saved prompts"
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        <DashboardPageHeader
          crumbs={["Dashboard", "Saved Prompts"]}
          description="All prompts you've saved for later"
          title="Saved Prompts"
        />

        <MotionReveal preset="viewportReveal">
          <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <p className="text-lg font-semibold text-slate-900">
                Total Saved: {items.length}
              </p>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 md:min-w-[300px]">
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

                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <span className="text-sm font-medium text-slate-500">Sort by</span>
                  <select
                    className="border-none bg-transparent text-sm font-medium text-slate-900 outline-none"
                    onChange={(event) => {
                      setSortBy(event.target.value);
                      setPage(1);
                    }}
                    value={sortBy}
                  >
                    {savedPromptSortOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-6">
              {filteredBookmarks.length === 0 ? (
                <SavedPromptsEmptyState hasBookmarks={items.length > 0} />
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {paginatedBookmarks.map((bookmark) => (
                      <SavedPromptCard
                        key={bookmark.bookmarkId || bookmark.id}
                        onRemove={() => setPendingRemoval(bookmark)}
                        prompt={bookmark}
                      />
                    ))}
                  </div>

                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      onPageChange={(nextPage) => setPage(Math.min(nextPage, totalPages))}
                      totalPages={totalPages}
                    />
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
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
              Remove Saved Prompt?
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Are you sure you want to remove this prompt from your saved list?
              You can always bookmark it again later.
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
