"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, Globe, HelpCircle, Lock, Save, Send, Sparkles, UploadCloud } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import FormSkeleton from "@/components/common/FormSkeleton";
import MotionReveal from "@/components/shared/MotionReveal";
import Button from "@/components/ui/Button";
import { useDashboard } from "@/hooks/useDashboard";
import {
  buildPromptQualityChecklist,
  CREATOR_DRAFT_STORAGE_KEY,
  creatorPromptDefaults,
  creatorPromptFilters,
  creatorPromptSchema,
} from "@/lib/creator";
import { toastError, toastSuccess, toastWarning } from "@/lib/toast";

const lightSecondaryButtonClass =
  "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950";

function FieldError({ message }) {
  return message ? <p className="text-sm font-medium text-rose-500">{message}</p> : null;
}

export default function DashboardPromptNew() {
  const router = useRouter();
  const previewRef = useRef(null);
  const {
    createOwnedPrompt,
    ownedPrompts,
    promptPerformance,
    status,
  } = useDashboard();
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [limitCtaVisible, setLimitCtaVisible] = useState(false);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm({
    defaultValues: creatorPromptDefaults,
    resolver: zodResolver(creatorPromptSchema),
  });

  const values = useWatch({ control });
  const checklist = buildPromptQualityChecklist(values);
  const promptCount = ownedPrompts.length;
  const freePromptUsage = `${Math.min(promptCount, 3)}/3`;
  const hasReachedSoftLimit = promptCount >= 3;
  const descriptionLength = values.description?.length || 0;
  const titleLength = values.title?.length || 0;
  const contentLength = values.content?.length || 0;
  const templateCards = useMemo(() => ownedPrompts.slice(0, 3), [ownedPrompts]);

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
      // Ignore invalid local draft state.
    }
  }, [reset]);

  async function onSubmit(formValues) {
    setLimitCtaVisible(false);

    try {
      await createOwnedPrompt(formValues);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(CREATOR_DRAFT_STORAGE_KEY);
      }
      toastSuccess("Prompt submitted for review");
      router.push("/dashboard/prompts");
    } catch (error) {
      const message = error.message || "Unable to submit this prompt.";
      const normalized = message.toLowerCase();

      if (
        normalized.includes("limit") ||
        normalized.includes("quota") ||
        normalized.includes("free prompt") ||
        normalized.includes("upgrade")
      ) {
        setLimitCtaVisible(true);
        toastWarning(message, {
          title: "Free plan limit reached",
        });
        return;
      }

      toastError(message);
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
    reset({
      title: prompt.title,
      description: prompt.description,
      category: prompt.category,
      aiTool: prompt.aiTool,
      tagsText: prompt.tagsText,
      difficulty: prompt.difficulty,
      visibility: prompt.visibilityValue,
      thumbnail: prompt.thumbnail || "",
      content: prompt.content,
    });
    toastSuccess(`Loaded ${prompt.title} into the editor`);
  }

  if (status === "loading") {
    return <FormSkeleton />;
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        crumbs={["Dashboard", "Add New Prompt"]}
        description="Create high-quality prompts that help others get better results."
        title="Add New Prompt"
      />

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        <MotionReveal preset="viewportReveal">
          <form className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <div>
                <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">1</div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Basic Information</h2>
              </div>

              <label className="block space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">Prompt Title</span>
                  <span className="text-xs text-slate-400">{titleLength}/100</span>
                </div>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  placeholder="Enter a clear and descriptive title..."
                  {...register("title")}
                />
                <FieldError message={errors.title?.message} />
              </label>

              <label className="block space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">Description</span>
                  <span className="text-xs text-slate-400">{descriptionLength}/250</span>
                </div>
                <textarea
                  className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  placeholder="Briefly describe what this prompt does, its use cases, and expected results..."
                  {...register("description")}
                />
                <FieldError message={errors.description?.message} />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
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

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">AI Tool</span>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                    {...register("aiTool")}
                  >
                    <option value="">Select an AI tool</option>
                    {creatorPromptFilters.aiTools.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.aiTool?.message} />
                </label>
              </div>

              <div>
                <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">2</div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Prompt Content</h2>
                  <span className="text-xs text-slate-400">Markdown supported</span>
                </div>
                <textarea
                  className="min-h-[220px] w-full rounded-[24px] border border-slate-200 bg-slate-950 px-4 py-4 font-mono text-sm leading-7 text-slate-100 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  placeholder="Write your prompt here..."
                  {...register("content")}
                />
                <div className="mt-2 flex justify-end">
                  <span className="text-xs text-slate-400">{contentLength} characters</span>
                </div>
                <FieldError message={errors.content?.message} />
              </div>

              <div>
                <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">3</div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Classification</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_1fr]">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">Tags</span>
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                      placeholder="Add tags and press Enter..."
                      {...register("tagsText")}
                    />
                    <p className="text-xs text-slate-400">e.g. AI, SEO, Blog, Marketing, ChatGPT</p>
                  </label>

                  <div className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Difficulty</span>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {creatorPromptFilters.difficulty.map((option) => (
                        <label
                          key={option}
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                            values.difficulty === option
                              ? "border-primary/30 bg-primary/[0.06] text-primary"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          <input className="hidden" type="radio" value={option} {...register("difficulty")} />
                          <span className={`h-3.5 w-3.5 rounded-full ${values.difficulty === option ? "bg-primary" : "bg-slate-200"}`} />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">4</div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Media (Thumbnail)</h2>
                <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/60 p-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <p className="mt-4 text-sm font-medium text-slate-700">Drag & drop an image here</p>
                      <p className="mt-1 text-sm text-primary">or click to browse</p>
                      <p className="mt-3 text-xs text-slate-400">Recommended: 1280x720 (16:9), JPG, PNG (Max 5MB)</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                      placeholder="Paste thumbnail URL"
                      {...register("thumbnail")}
                    />
                    <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-slate-950">
                      {values.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt="Prompt thumbnail preview" className="h-40 w-full object-cover" src={values.thumbnail} />
                      ) : (
                        <div className="flex h-40 items-center justify-center bg-[linear-gradient(135deg,rgba(99,102,241,0.92),rgba(139,92,246,0.84),rgba(56,189,248,0.72))]">
                          <Sparkles className="h-10 w-10 text-white" />
                        </div>
                      )}
                    </div>
                    <FieldError message={errors.thumbnail?.message} />
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">5</div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Access</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {[
                    {
                      value: "public",
                      label: "Public",
                      description: "Anyone can view and use this prompt",
                      icon: Globe,
                    },
                    {
                      value: "private",
                      label: "Private / Premium",
                      description: "Only premium users can view and use",
                      icon: Lock,
                    },
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <label
                        key={option.value}
                        className={`cursor-pointer rounded-[24px] border px-4 py-4 transition ${
                          values.visibility === option.value ? "border-primary/35 bg-primary/[0.06]" : "border-slate-200 bg-white"
                        }`}
                      >
                        <input className="hidden" type="radio" value={option.value} {...register("visibility")} />
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
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

              <div className="grid gap-3 md:grid-cols-3">
                <Button className={lightSecondaryButtonClass} isLoading={isSavingDraft} onPress={handleSaveDraft} type="button" variant="secondary">
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>
                <Button className={lightSecondaryButtonClass} onPress={handlePreviewScroll} type="button" variant="secondary">
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button isLoading={isSubmitting} type="submit">
                  <Send className="h-4 w-4" />
                  Submit for Review
                </Button>
              </div>
            </div>
          </form>
        </MotionReveal>

        <div className="space-y-6">
          <MotionReveal preset="viewportReveal">
            <section className="rounded-[28px] border border-emerald-200 bg-emerald-50/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.04)] md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-emerald-700">Your prompt is waiting for admin approval.</h2>
                  <p className="mt-2 text-sm leading-6 text-emerald-700/80">We&apos;ll notify you once it&apos;s approved and live.</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            </section>
          </MotionReveal>

          <MotionReveal preset="viewportReveal">
            <section ref={previewRef} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Live Preview</h2>
              </div>

              <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50/60 p-5">
                <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                  {values.title || "Your Prompt Title Will Appear Here"}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {values.category ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">{values.category}</span> : null}
                  {values.aiTool ? <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600">{values.aiTool}</span> : null}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  {values.description || "Your description will appear here. This helps users understand the purpose and benefits of your prompt."}
                </p>

                <div className="mt-5 rounded-[20px] bg-slate-950 p-4 font-mono text-sm leading-7 text-slate-100">
                  {values.content || "Your prompt content will appear here in a beautifully formatted way..."}
                </div>

                <div className="mt-5 grid gap-3 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-900">Difficulty:</span> {values.difficulty}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Tags:</span>{" "}
                    {values.tagsText
                      ? values.tagsText.split(",").map((tag) => tag.trim()).filter(Boolean).join(", ")
                      : "tag1, tag2, tag3"}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <span className="font-semibold text-slate-900">Access:</span>
                    {values.visibility === "private" ? <Lock className="h-4 w-4 text-indigo-500" /> : <Globe className="h-4 w-4 text-emerald-500" />}
                    {values.visibility === "private" ? "Private Premium" : "Public"}
                  </p>
                </div>
              </div>
            </section>
          </MotionReveal>

          <MotionReveal preset="viewportReveal">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
              <h2 className="text-2xl font-semibold tracking-tight text-primary">Tips for a Great Prompt</h2>
              <div className="mt-5 space-y-3">
                {[
                  "Be specific and clear about what you want.",
                  "Include context, constraints, and desired output format.",
                  "Use variables like [topic], [style], [length] for flexibility.",
                  "Test your prompt before submitting.",
                  "Good prompts get more copies and better ratings!",
                ].map((tip) => (
                  <div key={tip} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-amber-500" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </section>
          </MotionReveal>

          <MotionReveal preset="viewportReveal">
            <section className="rounded-[28px] bg-[linear-gradient(135deg,rgba(99,102,241,0.96),rgba(139,92,246,0.92),rgba(56,189,248,0.88))] p-6 text-white shadow-[0_26px_70px_rgba(99,102,241,0.26)]">
              <h2 className="text-3xl font-semibold tracking-tight">Unlock Your Full Potential</h2>
              <p className="mt-3 text-sm leading-6 text-white/80">
                You&apos;ve used {freePromptUsage} free prompts. Upgrade to Premium for unlimited prompt creation, priority review, and exclusive features.
              </p>
              <Button className="mt-5 border-0 bg-white text-slate-950 hover:bg-white/90" variant="secondary">
                Upgrade Now for $5
              </Button>
            </section>
          </MotionReveal>

          <MotionReveal preset="viewportReveal">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-slate-500" />
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">Need help?</h2>
                  <p className="mt-1 text-sm text-slate-500">Check our prompt writing guide or contact support.</p>
                </div>
              </div>
              <Button
                className={`mt-5 ${lightSecondaryButtonClass}`}
                onPress={() => toastWarning("Guide content will be connected later.")}
                variant="secondary"
              >
                View Guide
              </Button>
            </section>
          </MotionReveal>

          {limitCtaVisible || hasReachedSoftLimit ? (
            <MotionReveal preset="viewportReveal">
              <section className="rounded-[28px] border border-warning/25 bg-warning/10 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.04)] md:p-6">
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">Free plan prompt limit</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  If the backend limit blocks your next submission, upgrade to Premium to unlock more prompt submissions and private prompt access.
                </p>
                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  <p>Current usage: {freePromptUsage}</p>
                  <p>Estimated copies tracked: {promptPerformance.totalCopies}</p>
                </div>
                <Button as={Link} className={`mt-5 ${lightSecondaryButtonClass}`} href="/pricing" variant="secondary">
                  Upgrade to Premium
                </Button>
              </section>
            </MotionReveal>
          ) : null}

          {templateCards.length > 0 ? (
            <MotionReveal preset="viewportReveal">
              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">My recent submissions</h2>
                <div className="mt-5 space-y-3">
                  {templateCards.map((prompt) => (
                    <div key={prompt.id} className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">{prompt.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{prompt.aiTool}</p>
                        </div>
                        <Button className={lightSecondaryButtonClass} onPress={() => applyTemplate(prompt)} size="sm" variant="secondary">
                          Use
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </MotionReveal>
          ) : null}
        </div>
      </div>
    </div>
  );
}
