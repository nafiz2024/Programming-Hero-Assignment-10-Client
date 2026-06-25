"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, Globe, Lock, Save, Send, Sparkles } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import FormSkeleton from "@/components/common/FormSkeleton";
import MotionReveal from "@/components/shared/MotionReveal";
import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import { useCreator } from "@/hooks/useCreator";
import {
  buildPromptQualityChecklist,
  CREATOR_DRAFT_STORAGE_KEY,
  creatorPromptDefaults,
  creatorPromptFilters,
  creatorPromptSchema,
} from "@/lib/creator";
import { toastError, toastSuccess } from "@/lib/toast";

const lightSecondaryButtonClass =
  "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950";

function FieldError({ message }) {
  return message ? <p className="text-sm font-medium text-rose-500">{message}</p> : null;
}

function TextField({ error, label, maxLength, register, ...props }) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {maxLength ? <span className="text-xs text-slate-400">{maxLength}</span> : null}
      </div>
      <input
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
        {...register}
        {...props}
      />
      <FieldError message={error} />
    </label>
  );
}

export default function CreatorPromptNew() {
  const router = useRouter();
  const previewRef = useRef(null);
  const { createPrompt, error, prompts, status } = useCreator();
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
    control,
  } = useForm({
    defaultValues: creatorPromptDefaults,
    resolver: zodResolver(creatorPromptSchema),
  });

  const values = useWatch({
    control,
  });
  const checklist = buildPromptQualityChecklist(values);
  const templatePrompts = prompts.slice(0, 3);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const storedValue = window.localStorage.getItem(CREATOR_DRAFT_STORAGE_KEY);

      if (storedValue) {
        reset({
          ...creatorPromptDefaults,
          ...JSON.parse(storedValue),
        });
      }
    } catch {
      // Ignore invalid local draft data and keep the form usable.
    }
  }, [reset]);

  async function onSubmit(formValues) {
    try {
      await createPrompt(formValues);

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(CREATOR_DRAFT_STORAGE_KEY);
      }

      toastSuccess("Prompt submitted for review");
      router.push("/creator/prompts");
    } catch (error) {
      toastError(error.message || "Unable to submit this prompt.");
    }
  }

  async function handleSaveDraft() {
    setIsSavingDraft(true);

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(CREATOR_DRAFT_STORAGE_KEY, JSON.stringify(values));
      }

      toastSuccess("Draft saved locally");
    } catch {
      toastError("Unable to save draft locally.");
    } finally {
      setIsSavingDraft(false);
    }
  }

  function handlePreviewScroll() {
    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function applyTemplate(prompt) {
    setValue("title", prompt.title);
    setValue("description", prompt.description);
    setValue("category", prompt.category);
    setValue("aiTool", prompt.aiTool);
    setValue("difficulty", prompt.difficulty);
    setValue("visibility", prompt.visibilityValue);
    setValue("tagsText", prompt.tagsText);
    setValue("thumbnail", prompt.thumbnail || "");
    setValue("content", prompt.content);
    toastSuccess(`Loaded template: ${prompt.title}`);
  }

  if (status === "loading") {
    return <FormSkeleton />;
  }

  if (status === "error" && prompts.length === 0) {
    return <ErrorState description={error} title="Unable to load creator workspace" />;
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        crumbs={["Creator", "Add New Prompt"]}
        description="Create a high-quality prompt to help others and grow your audience."
        title="Add New Prompt"
      />

      <div className="flex flex-wrap gap-3">
        <Button className={lightSecondaryButtonClass} isLoading={isSavingDraft} onPress={handleSaveDraft} variant="secondary">
          <Save className="h-4 w-4" />
          Save Draft
        </Button>
        <Button className={lightSecondaryButtonClass} onPress={handlePreviewScroll} variant="secondary">
          <Eye className="h-4 w-4" />
          Preview
        </Button>
        <Button isLoading={isSubmitting} onPress={handleSubmit(onSubmit)}>
          <Send className="h-4 w-4" />
          Submit for Review
        </Button>
      </div>

      <form className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]" onSubmit={handleSubmit(onSubmit)}>
        <MotionReveal preset="viewportReveal">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Basic Information</h2>
                <p className="mt-2 text-sm text-slate-500">Clear metadata helps reviewers and buyers understand your prompt faster.</p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <TextField
                  error={errors.title?.message}
                  label="Prompt Title"
                  maxLength={`${values.title?.length || 0}/80`}
                  placeholder="Enter a catchy and descriptive title"
                  register={register("title")}
                />

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">AI Tool / Model</span>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                    {...register("aiTool")}
                  >
                    <option value="">Select AI tool or model</option>
                    {creatorPromptFilters.aiTools.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.aiTool?.message} />
                </label>
              </div>

              <label className="block space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">Description</span>
                  <span className="text-xs text-slate-400">{values.description?.length || 0}/200</span>
                </div>
                <textarea
                  className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  placeholder="Explain what this prompt does, how to use it, and the results one can expect."
                  {...register("description")}
                />
                <FieldError message={errors.description?.message} />
              </label>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Category</span>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                    {...register("category")}
                  >
                    <option value="">Select a category</option>
                    {creatorPromptFilters.categories.slice(1).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.category?.message} />
                </label>

                <TextField
                  error={errors.tagsText?.message}
                  label="Tags"
                  placeholder="Add tags separated by commas"
                  register={register("tagsText")}
                />
              </div>

              <label className="block space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">Prompt Content</span>
                  <span className="text-xs text-slate-400">{values.content?.length || 0}/4000</span>
                </div>
                <textarea
                  className="min-h-[260px] w-full rounded-[24px] border border-slate-200 bg-slate-950 px-4 py-4 font-mono text-sm leading-7 text-slate-100 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  placeholder="Write your prompt here. Use Markdown for better formatting."
                  {...register("content")}
                />
                <FieldError message={errors.content?.message} />
              </label>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <span className="text-sm font-medium text-slate-700">Difficulty Level</span>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {creatorPromptFilters.difficulty.map((option) => (
                      <label
                        key={option}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-4 text-sm font-medium transition ${
                          values.difficulty === option
                            ? "border-primary/30 bg-primary/[0.06] text-primary"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <input className="hidden" type="radio" value={option} {...register("difficulty")} />
                        <span className={`h-3.5 w-3.5 rounded-full ${values.difficulty === option ? "bg-primary" : "bg-slate-200"}`} />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-sm font-medium text-slate-700">Access Type</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { value: "public", label: "Public", description: "Anyone can view and use this prompt.", icon: Globe },
                      { value: "private", label: "Private", description: "Only premium users can access this prompt.", icon: Lock },
                    ].map((option) => {
                      const Icon = option.icon;

                      return (
                        <label
                          key={option.value}
                          className={`cursor-pointer rounded-[24px] border px-4 py-4 transition ${
                            values.visibility === option.value
                              ? "border-primary/35 bg-primary/[0.06] shadow-[0_16px_40px_rgba(99,102,241,0.12)]"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <input className="hidden" type="radio" value={option.value} {...register("visibility")} />
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-950">{option.label}</p>
                              <p className="mt-1 text-sm text-slate-500">{option.description}</p>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <TextField
                error={errors.thumbnail?.message}
                label="Thumbnail URL (Optional)"
                placeholder="https://example.com/prompt-preview.jpg"
                register={register("thumbnail")}
              />

              <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                <Button className={lightSecondaryButtonClass} isLoading={isSavingDraft} onPress={handleSaveDraft} type="button" variant="secondary">
                  Save Draft
                </Button>
                <Button className={lightSecondaryButtonClass} onPress={handlePreviewScroll} type="button" variant="secondary">
                  Preview
                </Button>
                <Button isLoading={isSubmitting} type="submit">
                  Submit for Review
                </Button>
              </div>
            </div>
          </section>
        </MotionReveal>

        <div className="space-y-6">
          <MotionReveal preset="viewportReveal">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Creator Tips</h2>
              <div className="mt-5 space-y-4">
                {[
                  "Be specific and detailed in your prompt.",
                  "Use variables to make your prompt reusable.",
                  "Test your prompt before submitting.",
                  "High-quality prompts typically earn more copies.",
                ].map((tip) => (
                  <div key={tip} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </section>
          </MotionReveal>

          <MotionReveal preset="viewportReveal">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Prompt Quality Checklist</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-500">
                  {checklist.completedCount}/{checklist.items.length}
                </span>
              </div>
              <div className="mt-5 space-y-4">
                {checklist.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className={item.complete ? "h-4 w-4 text-emerald-500" : "h-4 w-4 text-slate-300"} />
                      <span className={item.complete ? "text-slate-700" : "text-slate-500"}>{item.label}</span>
                    </div>
                    <span className={item.complete ? "font-semibold text-emerald-600" : "text-slate-400"}>{item.complete ? "Done" : "Pending"}</span>
                  </div>
                ))}
              </div>
            </section>
          </MotionReveal>

          <MotionReveal preset="viewportReveal">
            <section ref={previewRef} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Live Preview</h2>
                <span className="rounded-full bg-primary/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  {values.visibility === "private" ? "Private" : "Public"}
                </span>
              </div>

              <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-950">
                {values.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={values.title || "Prompt thumbnail preview"} className="h-44 w-full object-cover" src={values.thumbnail} />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-[linear-gradient(135deg,rgba(99,102,241,0.85),rgba(139,92,246,0.8),rgba(56,189,248,0.72))]">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                )}

                <div className="space-y-4 p-5">
                  <div className="flex flex-wrap gap-2">
                    {values.category ? (
                      <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-medium text-violet-200">{values.category}</span>
                    ) : null}
                    {values.aiTool ? (
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200">{values.aiTool}</span>
                    ) : null}
                    {values.difficulty ? (
                      <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-medium text-sky-200">{values.difficulty}</span>
                    ) : null}
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight text-white">
                      {values.title || "Your prompt title will appear here"}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {values.description || "Add a short description to explain what this prompt does and who it helps."}
                    </p>
                  </div>

                  <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4 font-mono text-sm leading-7 text-slate-200">
                    {values.content || "Prompt content preview will update as you write."}
                  </div>

                  {values.tagsText ? (
                    <div className="flex flex-wrap gap-2">
                      {values.tagsText
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean)
                        .map((tag) => (
                          <span key={tag} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-slate-300">
                            #{tag}
                          </span>
                        ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          </MotionReveal>

          <MotionReveal preset="viewportReveal">
            <section className="rounded-[28px] border border-amber-200 bg-amber-50/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.04)] md:p-6">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Previous Prompt Templates</h2>
              <div className="mt-5 space-y-4">
                {templatePrompts.length > 0 ? (
                  templatePrompts.map((prompt) => (
                    <div key={prompt.id} className="rounded-[22px] border border-amber-100 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-slate-950">{prompt.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{prompt.aiTool}</p>
                        </div>
                        <Button className={lightSecondaryButtonClass} onPress={() => applyTemplate(prompt)} size="sm" variant="secondary">
                          Use Template
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-amber-100 bg-white p-4 text-sm text-slate-500">
                    Publish a few prompts and your strongest templates will appear here for quick reuse.
                  </div>
                )}
              </div>
            </section>
          </MotionReveal>

          <MotionReveal preset="viewportReveal">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Private Prompts Get More</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Private prompts are visible to premium users only and can earn more copies as creator monetization expands.
              </p>
              <Button as={Link} className={`mt-5 ${lightSecondaryButtonClass}`} href="/creator" variant="secondary">
                Learn More
              </Button>
            </section>
          </MotionReveal>
        </div>
      </form>
    </div>
  );
}
