"use client";

import clsx from "clsx";

import Button from "@/components/ui/Button";
import SelectField from "@/components/ui/SelectField";
import { marketplaceFilterOptions, marketplaceFilterSections } from "@/lib/marketplace";

export default function MarketplaceFilterPanel({
  counts,
  filters,
  layout = "sidebar",
  onClear,
  onFilterChange,
}) {
  const isSidebar = layout === "sidebar";

  if (isSidebar) {
    return (
      <aside className="pf-card rounded-xl p-5">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-h3">Filters</p>
            <p className="mt-1 text-body-xs text-muted">Refine prompt discovery</p>
          </div>
          <button className="text-body-sm font-medium text-primary" onClick={onClear} type="button">
            Clear All
          </button>
        </div>

        <div className="space-y-6">
          {marketplaceFilterSections.map(({ key, label }) => (
            <div key={key} className="space-y-3">
              <h4 className="text-body-sm font-semibold text-foreground">{label}</h4>
              <div className="space-y-2">
                {marketplaceFilterOptions[key].map((option) => (
                  <label key={option} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition hover:bg-white/[0.04]">
                    <span className="flex items-center gap-3">
                      <input
                        checked={filters[key] === option}
                        className="h-4 w-4 rounded border-white/20 bg-transparent text-primary accent-primary"
                        name={key}
                        onChange={() => onFilterChange(key, option)}
                        type="radio"
                      />
                      <span className={clsx("text-body-sm", filters[key] === option ? "text-primary" : "text-foreground")}>
                        {option}
                      </span>
                    </span>
                    <span className="text-body-xs text-muted">{counts?.[key]?.[option] ?? 0}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <div className="grid gap-4">
      {marketplaceFilterSections.map(({ key, label }) => (
        <SelectField
          key={key}
          label={label}
          onChange={(event) => onFilterChange(key, event.target.value)}
          options={marketplaceFilterOptions[key]}
          value={filters[key]}
        />
      ))}
      <Button onPress={onClear} size="lg" variant="secondary">
        Clear Filters
      </Button>
    </div>
  );
}
