import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Todas as páginas são dinâmicas (nonce da CSP), por isso não é preciso cache incremental.
export default defineCloudflareConfig({});
