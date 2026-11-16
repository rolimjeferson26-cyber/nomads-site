import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { CABECALHOS_SEGURANCA } from "./src/lib/seguranca";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // As imagens são SVG/WebP já otimizados; evita depender do serviço de imagens da Cloudflare.
  images: { unoptimized: true },
  experimental: {
    // Uploads de arte nos orçamentos (máx. 5 MB) + margem do multipart
    serverActions: { bodySizeLimit: "6mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: Object.entries(CABECALHOS_SEGURANCA).map(([key, value]) => ({ key, value })),
      },
    ];
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
