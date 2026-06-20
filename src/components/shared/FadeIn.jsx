"use client";

import { motion } from "framer-motion";

export default function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.35,
  y = 16,
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={className}
      initial={{ opacity: 0, y }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
