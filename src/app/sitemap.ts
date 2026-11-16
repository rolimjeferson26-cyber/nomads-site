import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return ["", "/loja", "/configurador", "/orcamentos", "/sobre", "/contactos", "/legal/termos", "/legal/privacidade", "/legal/cookies"].map(
    (p) => ({ url: `${base}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : 0.7 }),
  );
}
