import PageContainer from "@/components/shared/PageContainer";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background/70">
      <PageContainer
        as="div"
        className="flex flex-col gap-3 py-6 text-body-sm text-muted md:flex-row md:items-center md:justify-between"
        size="xl"
      >
        <p>Dark premium design system foundation for future PromptFlow pages.</p>
        <p>Responsive shell, motion, toast, and loading systems are now centralized.</p>
      </PageContainer>
    </footer>
  );
}
