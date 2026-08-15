"use client";

import { motion } from "framer-motion";

export function AnimatedBlob({ className }: { className?: string }) {
  return (
    <motion.div
      className={className}
      aria-hidden
      animate={{
        x: [0, 16, -8, 0],
        y: [0, -12, 10, 0],
        scale: [1, 1.08, 0.96, 1],
      }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
