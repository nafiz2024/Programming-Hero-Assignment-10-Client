"use client";

import { forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";

const AuthField = forwardRef(function AuthField(
  {
    className,
    error,
    icon: Icon,
    inputClassName,
    label,
    onToggleVisibility,
    rightLabel,
    showVisibilityToggle = false,
    type = "text",
    visible = false,
    ...props
  },
  ref,
) {
  return (
    <label className={clsx("block space-y-2", className)}>
      <span className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
        <span>{label}</span>
        {rightLabel}
      </span>
      <div
        className={clsx(
          "flex min-h-[56px] items-center gap-3 rounded-2xl border bg-white px-4 text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition duration-300",
          error
            ? "border-rose-300 ring-2 ring-rose-100"
            : "border-slate-200 hover:border-slate-300 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10",
        )}
      >
        {Icon ? <Icon className="h-5 w-5 shrink-0 text-slate-400" /> : null}
        <input
          ref={ref}
          className={clsx(
            "w-full border-none bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400",
            inputClassName,
          )}
          type={showVisibilityToggle ? (visible ? "text" : "password") : type}
          {...props}
        />
        {showVisibilityToggle ? (
          <button
            aria-label={visible ? "Hide password" : "Show password"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={onToggleVisibility}
            type="button"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
      {error ? <p className="text-sm font-medium text-rose-500">{error}</p> : null}
    </label>
  );
});

export default AuthField;

