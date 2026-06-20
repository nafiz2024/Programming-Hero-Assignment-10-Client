"use client";

import { motion, useReducedMotion } from "framer-motion";

import { motionPresets } from "@/lib/motion";

export function MotionStagger({
  as: Component = motion.div,
  children,
  className,
  once = true,
  preset = "staggerFadeUp",
  amount = 0.2,
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

export function MotionStaggerItem({ as: Component = motion.div, children, className, preset = "staggerFadeUp", ...props }) {
  const shouldReduceMotion = useReducedMotion();
  const selectedPreset = shouldReduceMotion ? motionPresets.reduced : motionPresets[preset];
  const itemVariants = selectedPreset.item || selectedPreset.variants;

  return (
    <Component className={className} transition={selectedPreset.transition} variants={itemVariants} {...props}>
      {children}
    </Component>
  );
}
