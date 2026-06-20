"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, LoaderCircle, SlidersHorizontal } from "lucide-react";

import MotionReveal from "@/components/shared/MotionReveal";
import { MotionStagger, MotionStaggerItem } from "@/components/shared/MotionStagger";
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
  getPaginatedPrompts,
  marketplaceFilterOptions,
  normalizePromptPayload,
  sortPrompts,
} from "@/lib/marketplace";

const PAGE_SIZE = 6;

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
    error: "",
  });

  async function loadPrompts() {
    setPromptState((currentState) => ({
      ...currentState,
      status: "loading",
      error: "",
    }));

    try {
      const response = await promptApi.getAll();
      const normalizedPrompts = normalizePromptPayload(response);

      setPromptState({
        status: "success",
        items: normalizedPrompts,
        error: "",
      });
    } catch (error) {
      setPromptState({
        status: "error",
        items: [],
        error: error.message || "Unable to load prompt marketplace.",
      });
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function fetchPrompts() {
      try {
        const response = await promptApi.getAll();
        const normalizedPrompts = normalizePromptPayload(response);

        if (isMounted) {
          setPromptState({
            status: "success",
            items: normalizedPrompts,
            error: "",
          });
        }
      } catch (error) {
        if (isMounted) {
          setPromptState({
            status: "error",
            items: [],
            error: error.message || "Unable to load prompt marketplace.",
          });
        }
      }
    }

    fetchPrompts();

    return () => {
      isMounted = false;
    };
  }, []);

  const counts = useMemo(() => getCounts(promptState.items), [promptState.items]);
  const filteredPrompts = useMemo(
    () => sortPrompts(filterPrompts(promptState.items, filters), filters.sortBy),
    [filters, promptState.items],
  );
  const totalPages = Math.max(1, Math.ceil(filteredPrompts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedPrompts = useMemo(
    () => getPaginatedPrompts(filteredPrompts, currentPage, PAGE_SIZE),
    [currentPage, filteredPrompts],
  );

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
                {formatCompactNumber(filteredPrompts.length)} results
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
          {promptState.status === "loading" ? <PromptGridSkeleton count={6} /> : null}

          {promptState.status === "error" ? (
            <ErrorState description={promptState.error} onRetry={loadPrompts} />
          ) : null}

          {promptState.status === "success" && filteredPrompts.length === 0 ? (
            <EmptyState
              description="Try adjusting your keywords or filters to find what you're looking for."
              onAction={handleClearFilters}
              title="No prompts matched your search"
            />
          ) : null}

          {promptState.status === "success" && filteredPrompts.length > 0 ? (
            <>
              <MotionStagger className="grid gap-4 md:grid-cols-2 desktop:grid-cols-3" preset="dashboardCardStagger">
                {paginatedPrompts.map((prompt) => (
                  <MotionStaggerItem key={prompt.id}>
                    <PromptCard {...prompt} />
                  </MotionStaggerItem>
                ))}
              </MotionStagger>
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
