"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import clsx from "clsx";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { motionPresets } from "@/lib/motion";

export default function ResponsiveDrawer({ children, isOpen, onClose, title }) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const shouldReduceMotion = useReducedMotion();
  const preset = shouldReduceMotion ? motionPresets.reduced : motionPresets.modalSpring;

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            animate="visible"
            className={clsx(
              isMobile
                ? "pf-mobile-sheet pf-safe-bottom inset-y-auto top-auto p-5"
                : "fixed right-4 top-4 bottom-4 w-[min(100%,380px)] rounded-xl p-5",
              "pf-card",
            )}
            exit="exit"
            initial="hidden"
            onClick={(event) => event.stopPropagation()}
            transition={preset.transition}
            variants={preset.variants}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-body-xs font-semibold uppercase tracking-[0.2em] text-primary">Drawer</p>
                <h3 className="text-h3">{title}</h3>
              </div>
              <button
                aria-label="Close drawer"
                className="pf-touch-target inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted transition hover:bg-white/10 hover:text-foreground"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
