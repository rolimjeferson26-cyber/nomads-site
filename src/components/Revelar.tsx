"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Aparece ao entrar no ecrã (respeita prefers-reduced-motion via MotionConfig).
export function Revelar({
  children,
  atraso = 0,
  className,
  y = 40,
}: {
  children: ReactNode;
  atraso?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: atraso, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
