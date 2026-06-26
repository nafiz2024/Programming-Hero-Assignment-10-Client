"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Filter, LoaderCircle, SlidersHorizontal } from "lucide-react";

import MotionReveal from "@/components/shared/MotionReveal";
import MarketplaceFilterPanel from "@/components/marketplace/MarketplaceFilterPanel";
import PromptCard from "@/components/marketplace/PromptCard";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Input from "@/components/ui/Input";
import Pagination from "@/components/ui/Pagination";
import PromptGridSkeleton from "@/components/ui/PromptGridSkeleton";
import ResponsiveDrawer from "@/components/ui/ResponsiveDrawer";
import SelectField from "@/components/ui/SelectField";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { promptApi } from "@/lib/api";
import {
  defaultMarketplaceFilters,
  filterPrompts,
  formatCompactNumber,
  getPromptItems,
  getPaginatedPrompts,
  marketplaceFilterOptions,
  normalizePromptPayload,
  sortPrompts,
} from "@/lib/marketplace";
import { enrichPromptsWithReviewSummaries, REVIEW_SYNC_EVENT } from "@/lib/reviews";

const PAGE_SIZE = 6;

function buildMarketplaceQuery(filters, page) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(PAGE_SIZE));

  if (filters.search.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.category !== marketplaceFilterOptions.category[0]) {
    params.set("category", filters.category);
  }

  if (filters.aiTool !== marketplaceFilterOptions.aiTool[0]) {
    params.set("aiTool", filters.aiTool);
  }

  if (filters.difficulty !== marketplaceFilterOptions.difficulty[0]) {
    params.set("difficulty", filters.difficulty);
  }

  if (filters.visibility !== marketplaceFilterOptions.visibility[0]) {
    params.set("visibility", filters.visibility);
  }

  const sortMap = {
    "Most Popular": "popular",
    "Highest Rated": "rating",
    "Most Copied": "copied",
    Newest: "latest",
  };

  params.set("sort", sortMap[filters.sortBy] || "popular");

  return `?${params.toString()}`;
}

function getCounts(prompts) {
  return {
    category: Object.fromEntries(
      marketplaceFilterOptions.category.map((option) => [
        option,
        option === marketplaceFilterOptions.category[0]
          ? prompts.length
          : prompts.filter((prompt) => prompt.category === option).length,
      ]),
    ),
    aiTool: Object.fromEntries(
      marketplaceFilterOptions.aiTool.map((option) => [
        option,
        option === marketplaceFilterOptions.aiTool[0]
          ? prompts.length
          : prompts.filter((prompt) => prompt.aiTool === option).length,
      ]),
    ),
    difficulty: Object.fromEntries(
      marketplaceFilterOptions.difficulty.map((option) => [
        option,
        option === marketplaceFilterOptions.difficulty[0]
          ? prompts.length
          : prompts.filter((prompt) => prompt.difficulty === option).length,
      ]),
    ),
    visibility: Object.fromEntries(
      marketplaceFilterOptions.visibility.map((option) => [
        option,
        option === marketplaceFilterOptions.visibility[0]
          ? prompts.length
          : option === "Public Prompts"
          ? prompts.filter((prompt) => prompt.visibility === "Public").length
          : prompts.filter((prompt) => prompt.visibility === "Premium").length,
      ]),
    ),
  };
}

function getPromptResponseMeta(response, fallbackLimit = PAGE_SIZE) {
  const promptItems = getPromptItems(response);
  const pagination = response?.pagination || response?.data?.pagination || null;
  const hasServerPagination = Boolean(
    pagination &&
      (pagination.totalPages !== undefined ||
        pagination.total !== undefined ||
        pagination.page !== undefined ||
        pagination.limit !== undefined),
  );
  const limit = Number(pagination?.limit || response?.limit || response?.pageSize || fallbackLimit);
  const total = Number(
    pagination?.total ||
      response?.total ||
      response?.count ||
      response?.totalCount ||
      response?.data?.total ||
      promptItems.length,
  );
  const totalPages = Number(
    pagination?.totalPages ||
      response?.totalPages ||
      response?.data?.totalPages ||
      Math.max(1, Math.ceil((total || promptItems.length) / Math.max(limit, 1))),
  );

  return {
    promptItems,
    hasServerPagination,
    total,
    totalPages: Math.max(1, totalPages || 1),
  };
}

export default function MarketplaceClient() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isDesktop = useMediaQuery("(min-width: 1200px)");
  const [filters, setFilters] = useState(defaultMarketplaceFilters);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTabletFiltersOpen, setIsTabletFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [promptState, setPromptState] = useState({
    status: "loading",
    items: [],
    allItems: [],
    isServerPaginated: false,
    total: 0,
    totalPages: 1,
    error: "",
  });
  const requestSequenceRef = useRef(0);

  const loadPrompts = useCallback(async (activeFilters = filters, activePage = page) => {
    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;

    setPromptState((currentState) => ({
      ...currentState,
      status: currentState.items.length > 0 ? "refreshing" : "loading",
      error: "",
    }));

    try {
      const response = await promptApi.getAll(buildMarketplaceQuery(activeFilters, activePage));
      const { hasServerPagination, promptItems, total, totalPages } = getPromptResponseMeta(response);
      const normalizedPrompts = await enrichPromptsWithReviewSummaries(
        normalizePromptPayload({ prompts: promptItems }, { fallbackOnEmpty: false }),
      );
      const filteredPrompts = sortPrompts(filterPrompts(normalizedPrompts, activeFilters), activeFilters.sortBy);
      const currentItems = hasServerPagination
        ? normalizedPrompts
        : getPaginatedPrompts(filteredPrompts, activePage, PAGE_SIZE);

      if (requestSequenceRef.current !== requestId) {
        return;
      }

      setPromptState({
        status: "success",
        items: currentItems,
        allItems: hasServerPagination ? [] : normalizedPrompts,
        isServerPaginated: hasServerPagination,
        total: hasServerPagination ? total : filteredPrompts.length,
        totalPages: hasServerPagination ? totalPages : Math.max(1, Math.ceil(filteredPrompts.length / PAGE_SIZE)),
        error: "",
      });
    } catch (error) {
      if (requestSequenceRef.current !== requestId) {
        return;
      }

      setPromptState({
        status: "error",
        items: [],
        allItems: [],
        isServerPaginated: false,
        total: 0,
        totalPages: 1,
        error: error.message || "Unable to load prompt marketplace.",
      });
    }
  }, [filters, page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadPrompts(filters, page);
    }, 0);

    function handleReviewSync() {
      loadPrompts(filters, page);
    }

    window.addEventListener(REVIEW_SYNC_EVENT, handleReviewSync);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(REVIEW_SYNC_EVENT, handleReviewSync);
    };
  }, [filters, loadPrompts, page]);

  const filteredPrompts = useMemo(
    () =>
      promptState.isServerPaginated
        ? promptState.items
        : sortPrompts(filterPrompts(promptState.allItems, filters), filters.sortBy),
    [filters, promptState.allItems, promptState.isServerPaginated, promptState.items],
  );
  const counts = useMemo(
    () => getCounts(promptState.isServerPaginated ? promptState.items : filteredPrompts),
    [filteredPrompts, promptState.isServerPaginated, promptState.items],
  );
  const totalPages = promptState.isServerPaginated
    ? Math.max(1, promptState.totalPages)
    : Math.max(1, Math.ceil(filteredPrompts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedPrompts = useMemo(
    () => (promptState.isServerPaginated ? promptState.items : getPaginatedPrompts(filteredPrompts, currentPage, PAGE_SIZE)),
    [currentPage, filteredPrompts, promptState.isServerPaginated, promptState.items],
  );
  const resultCount = promptState.isServerPaginated ? promptState.total : filteredPrompts.length;
  const hasVisiblePrompts = paginatedPrompts.length > 0;

  function handleFilterChange(key, value) {
    setPage(1);
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }));
  }

  function handleClearFilters() {
    setPage(1);
    setFilters(defaultMarketplaceFilters);
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <MotionReveal preset="contentFade">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-body-xs text-muted">
            <span className="text-primary">Home</span>
            <span>/</span>
            <span>All Prompts</span>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-display-md">Explore AI Prompts</h1>
              <span className="rounded-pill border border-primary/16 bg-primary/10 px-3 py-1.5 text-body-sm font-medium text-primary">
                {formatCompactNumber(resultCount)} results
              </span>
            </div>
            <p className="max-w-3xl text-body text-muted">
              Discover high-quality, tested prompts across different AI tools and categories.
            </p>
          </div>
        </div>
      </MotionReveal>

      <MotionReveal preset="viewportReveal">
        <div className="pf-card rounded-xl p-4 md:p-5">
          <div className="grid gap-4 desktop:grid-cols-[minmax(0,1.3fr)_repeat(4,minmax(0,0.65fr))_auto] desktop:items-end">
            <Input
              className="desktop:col-span-1"
              inputClassName="placeholder:text-muted"
              onChange={(event) => handleFilterChange("search", event.target.value)}
              placeholder="Search prompt title or tags..."
              showSearchIcon
              value={filters.search}
            />

            <div className="hidden desktop:contents">
              <SelectField
                label="Category"
                onChange={(event) => handleFilterChange("category", event.target.value)}
                options={marketplaceFilterOptions.category}
                value={filters.category}
              />
              <SelectField
                label="AI Tool"
                onChange={(event) => handleFilterChange("aiTool", event.target.value)}
                options={marketplaceFilterOptions.aiTool}
                value={filters.aiTool}
              />
              <SelectField
                label="Difficulty"
                onChange={(event) => handleFilterChange("difficulty", event.target.value)}
                options={marketplaceFilterOptions.difficulty}
                value={filters.difficulty}
              />
              <SelectField
                label="Visibility"
                onChange={(event) => handleFilterChange("visibility", event.target.value)}
                options={marketplaceFilterOptions.visibility}
                value={filters.visibility}
              />
            </div>

            <div className="flex items-center gap-3 desktop:justify-end">
              {!isDesktop ? (
                <Button
                  onPress={() => (isMobile ? setIsDrawerOpen(true) : setIsTabletFiltersOpen((open) => !open))}
                  size="md"
                  variant="secondary"
                >
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              ) : (
                <button className="inline-flex items-center gap-2 text-body-sm font-medium text-primary" onClick={handleClearFilters} type="button">
                  <LoaderCircle className="h-4 w-4" />
                  Clear Filters
                </button>
              )}

              <SelectField
                className="min-w-[170px]"
                label="Sort by"
                onChange={(event) => handleFilterChange("sortBy", event.target.value)}
                options={marketplaceFilterOptions.sortBy}
                value={filters.sortBy}
              />
            </div>
          </div>

          {!isDesktop && !isMobile ? (
            <div className="mt-4 border-t border-white/8 pt-4">
              <button
                className="inline-flex items-center gap-2 text-body-sm font-medium text-primary"
                onClick={() => setIsTabletFiltersOpen((open) => !open)}
                type="button"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {isTabletFiltersOpen ? "Hide filters" : "Show filters"}
              </button>

              {isTabletFiltersOpen ? (
                <div className="mt-4">
                  <MarketplaceFilterPanel
                    counts={counts}
                    filters={filters}
                    layout="stacked"
                    onClear={handleClearFilters}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </MotionReveal>

      <div className="grid gap-6 desktop:grid-cols-[280px_minmax(0,1fr)]">
        <div className="hidden desktop:block">
          <MarketplaceFilterPanel
            counts={counts}
            filters={filters}
            onClear={handleClearFilters}
            onFilterChange={handleFilterChange}
          />
        </div>

        <div className="space-y-6">
          {promptState.status === "loading" && !hasVisiblePrompts ? <PromptGridSkeleton count={6} /> : null}

          {promptState.status === "error" ? (
            <ErrorState description={promptState.error} onRetry={loadPrompts} />
          ) : null}

          {promptState.status === "success" && resultCount === 0 ? (
            <EmptyState
              description="Try adjusting your keywords or filters to find what you're looking for."
              onAction={handleClearFilters}
              title="No prompts matched your search"
            />
          ) : null}

          {promptState.status !== "error" && hasVisiblePrompts ? (
            <>
              <div
                className="grid gap-4 md:grid-cols-2 desktop:grid-cols-3"
                key={`${currentPage}-${paginatedPrompts.map((prompt) => prompt.id).join("-")}`}
              >
                {paginatedPrompts.map((prompt) => (
                  <div key={prompt.id}>
                    <PromptCard {...prompt} />
                  </div>
                ))}
              </div>
              <Pagination currentPage={currentPage} onPageChange={setPage} totalPages={totalPages} />
            </>
          ) : null}
        </div>
      </div>

      <ResponsiveDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Filters">
        <MarketplaceFilterPanel
          counts={counts}
          filters={filters}
          layout="stacked"
          onClear={() => {
            handleClearFilters();
            setIsDrawerOpen(false);
          }}
          onFilterChange={handleFilterChange}
        />
      </ResponsiveDrawer>
    </div>
  );
}
