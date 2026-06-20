import Link from "next/link";
import { MessageSquareQuote, Sparkles, Star } from "lucide-react";

import MotionReveal from "@/components/shared/MotionReveal";

const variantCopy = {
  login: {
    title: (
      <>
        Better <span className="bg-brand-gradient bg-clip-text text-transparent">Prompts.</span>
        <br />
        Better <span className="bg-brand-gradient bg-clip-text text-transparent">Results.</span>
      </>
    ),
    description:
      "Discover, create, and use high-quality AI prompts to save time, boost productivity, and get outstanding results.",
    editorTitle: "New Prompt",
    editorAction: "Save",
    editorBody: [
      "Write a blog post about AI in marketing",
      "### Instructions:",
      "1. Write an engaging blog introduction",
      "2. Explain key benefits of AI",
      "3. Provide real-world examples",
      "4. Conclude with future outlook",
    ],
    chips: ["Marketing", "Copywriting", "Development", "Productivity"],
    quote:
      '"PromptFlow has completely changed the way I work with AI. The prompts are on point and save me hours every day."',
    quoteAuthor: "Daniel Martinez",
    quoteRole: "Full Stack Developer",
    stats: [
      { value: "50K+", label: "Active Creators" },
      { value: "1.2M+", label: "Prompts Shared" },
      { value: "10M+", label: "Copies Made" },
    ],
  },
  register: {
    title: (
      <>
        Create Once.
        <br />
        Inspire <span className="bg-brand-gradient bg-clip-text text-transparent">Millions.</span>
      </>
    ),
    description:
      "Join thousands of creators and professionals sharing AI prompts that drive real results and save countless hours.",
    editorTitle: "New Prompt",
    editorAction: "+",
    editorBody: [
      "Write a product launch email for",
      "a new AI-powered design tool.",
      "### Instruction:",
      "1. Catchy subject line",
      "2. Explain key benefits",
      "3. Include a strong CTA",
      "4. Keep it concise and engaging",
    ],
    chips: ["Creator", "Growth", "SaaS", "Automation"],
    quote:
      '"PromptFlow helped me turn my ideas into a sustainable income. The community and tools are incredible!"',
    quoteAuthor: "Alex Morgan",
    quoteRole: "Top Creator",
    stats: [
      { value: "50K+", label: "Active Creators" },
      { value: "1.2M+", label: "Prompts Shared" },
      { value: "10M+", label: "Copies Made" },
    ],
  },
};

export default function AuthPageShell({
  children,
  formIntro,
  formTitle,
  mode = "login",
}) {
  const copy = variantCopy[mode] || variantCopy.login;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.16),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.14),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <div className="grid min-h-screen desktop:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <aside className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.12),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.2),transparent_28%),linear-gradient(180deg,#050816_0%,#070c1d_55%,#0a1025_100%)] px-8 py-10 desktop:block desktop:px-10">
          <div className="absolute inset-0 opacity-70">
            <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(180deg,transparent_0%,rgba(99,102,241,0.08)_40%,rgba(99,102,241,0.2)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(0deg,rgba(99,102,241,0.18),transparent)] [mask-image:linear-gradient(180deg,transparent,white)]" />
            <div className="absolute right-20 top-12 h-80 w-80 rounded-full border border-primary/15" />
            <div className="absolute right-8 top-28 h-60 w-60 rounded-full border border-secondary/15" />
            <div className="absolute right-12 top-24 h-3 w-3 rounded-full bg-primary shadow-[0_0_24px_rgba(139,92,246,0.95)]" />
            <div className="absolute right-32 top-56 h-3 w-3 rounded-full bg-secondary shadow-[0_0_24px_rgba(96,165,250,0.95)]" />
          </div>

          <div className="relative z-10 flex h-full flex-col">
            <Link className="inline-flex items-center gap-3 text-white" href="/">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="text-[2rem] font-semibold tracking-tight">PromptFlow</span>
            </Link>

            <MotionReveal className="mt-20 max-w-xl space-y-6" preset="viewportReveal">
              <h1 className="text-[4rem] font-semibold leading-[1.02] tracking-[-0.05em] text-white">
                {copy.title}
              </h1>
              <p className="max-w-lg text-xl leading-9 text-slate-300">{copy.description}</p>
            </MotionReveal>

            <MotionReveal className="mt-12" preset="viewportReveal">
              <div className="overflow-hidden rounded-[28px] border border-primary/25 bg-[linear-gradient(180deg,rgba(16,24,48,0.98),rgba(9,16,34,0.98))] shadow-[0_30px_80px_rgba(8,15,34,0.56)]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                      <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                      <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                    </div>
                    <span className="rounded-pill bg-white/6 px-4 py-1.5 text-sm">{copy.editorTitle}</span>
                  </div>
                  <span className="rounded-pill bg-brand-gradient px-4 py-1.5 text-sm font-semibold">
                    {copy.editorAction}
                  </span>
                </div>
                <div className="relative min-h-[320px] px-6 py-7 font-mono text-[1.35rem] leading-10 text-slate-100">
                  {copy.editorBody.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  <div className="absolute bottom-8 right-8 flex h-28 w-28 items-center justify-center rounded-[28px] border border-primary/30 bg-primary/12 text-[3rem] font-semibold text-primary shadow-glow">
                    AI
                  </div>
                </div>
              </div>
            </MotionReveal>

            <MotionReveal className="mt-8 grid grid-cols-3 gap-4" preset="viewportReveal">
              {copy.stats.map((stat) => (
                <div key={stat.label} className="rounded-[22px] border border-primary/20 bg-white/[0.04] px-5 py-5 text-white shadow-[0_12px_40px_rgba(15,23,42,0.18)]">
                  <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
                  <p className="mt-2 text-sm text-slate-300">{stat.label}</p>
                </div>
              ))}
            </MotionReveal>

            <MotionReveal className="mt-auto" preset="viewportReveal">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-white shadow-[0_18px_60px_rgba(8,15,34,0.28)]">
                <div className="mb-4 flex items-center gap-1 text-warning">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={`star-${index}`} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-lg leading-8 text-slate-200">{copy.quote}</p>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold">{copy.quoteAuthor}</p>
                    <p className="text-sm text-primary">{copy.quoteRole}</p>
                  </div>
                  <MessageSquareQuote className="h-10 w-10 text-primary/80" />
                </div>
              </div>
            </MotionReveal>
          </div>
        </aside>

        <section className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 desktop:px-10">
          <div className="absolute inset-0 opacity-60">
            <div className="absolute left-12 top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-10 right-12 h-44 w-44 rounded-full bg-secondary/10 blur-3xl" />
          </div>
          <MotionReveal className="relative z-10 w-full max-w-[560px]" preset="contentFade">
            <div className="overflow-hidden rounded-[32px] border border-white/65 bg-white/88 p-6 shadow-[0_35px_100px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8 md:p-10">
              <div className="mb-8 text-center">
                <Link className="mb-5 inline-flex items-center gap-3 text-slate-950 desktop:hidden" href="/">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-semibold tracking-tight">PromptFlow</span>
                </Link>
                <h1 className="text-[2.2rem] font-semibold tracking-[-0.04em] text-slate-950 md:text-[2.5rem]">
                  {formTitle}
                </h1>
                <p className="mt-3 text-lg text-slate-500">{formIntro}</p>
              </div>
              {children}
            </div>
          </MotionReveal>
        </section>
      </div>
    </div>
  );
}

