"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";

import { motionPresets } from "@/lib/motion";

export default function FadeIn({
  children,
  className,
  delay = 0,
  duration,
}) {
  const shouldReduceMotion = useReducedMotion();
  const preset = shouldReduceMotion ? motionPresets.reduced : motionPresets.contentFade;

  return (
    <motion.div
      animate="visible"
      className={className}
      initial="hidden"
      transition={{
        ...preset.transition,
        delay,
        duration: duration ?? preset.transition.duration,
      }}
      variants={preset.variants}
    >
      {children}
    </motion.div>
  );
}
