"use client";

import { useEffect } from "react";
import { carrinho } from "@/lib/carrinho";

export function LimparCarrinho() {
  useEffect(() => carrinho.limpar(), []);
  return null;
}
