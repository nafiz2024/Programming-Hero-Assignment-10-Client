"use client";

import { motion, useReducedMotion } from "framer-motion";

import { motionPresets } from "@/lib/motion";

export default function MotionReveal({
  as: Component = motion.div,
  children,
  className,
  once = true,
  preset = "viewportReveal",
  amount = 0.25,
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();
  const selectedPreset = shouldReduceMotion ? motionPresets.reduced : motionPresets[preset];

  return (
    <Component
      className={className}
      initial="hidden"
      transition={selectedPreset.transition}
      variants={selectedPreset.variants}
      viewport={{ once, amount }}
      whileInView="visible"
      {...props}
    >
      {children}
    </Component>
  );
}
