import "server-only";
import Stripe from "stripe";
import { segredo } from "@/lib/env";

export function stripe(): Stripe | null {
  const chave = segredo("STRIPE_SECRET_KEY");
  if (!chave) return null;
  // fetch funciona no runtime dos Cloudflare Workers
  return new Stripe(chave, { httpClient: Stripe.createFetchHttpClient() });
}

export const cryptoProvider = Stripe.createSubtleCryptoProvider();
