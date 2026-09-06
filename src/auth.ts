import { Context, Next, MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { verifyJWT } from "./jwt";
import type { AppContext } from "./env";

import { paymentMiddleware } from "@x402/hono";
import {
  HTTPFacilitatorClient,
  x402ResourceServer,
} from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

export interface ProtectedRouteConfig {
  pattern: string;
  price: string;
  description: string;
  bot_score_threshold?: number;
  except_detection_ids?: number[];
}

export function requirePaymentOrCookie(
  paymentMw: MiddlewareHandler
) {
  return async (c: Context<AppContext>, next: Next) => {
    const token = getCookie(c, "auth_token");

    if (token) {
      const jwtSecret = c.env.JWT_SECRET;

      if (!jwtSecret) {
        return c.json(
          {
            error:
              "Server misconfigured: JWT_SECRET not set. See README for setup instructions.",
          },
          500
        );
      }

      const payload = await verifyJWT(token, jwtSecret);

      if (payload) {
        c.set("auth", payload);
        await next();
        return;
      }
    }

    return await paymentMw(c, next);
  };
}

export function createProtectedRoute(
  config: ProtectedRouteConfig
) {
  return async (c: Context<AppContext>, next: Next) => {
    const rawPath = c.req.path;
    const routePath =
      rawPath.length > 1 ? rawPath.replace(/\/+$/, "") : rawPath;

    const facilitatorUrl = c.env.FACILITATOR_URL;

    if (!facilitatorUrl) {
      return c.json(
        {
          error: "FACILITATOR_URL is not configured",
        },
        500
      );
    }

    const facilitatorClient = new HTTPFacilitatorClient({
      url: facilitatorUrl,
    });

    const resourceServer = new x402ResourceServer(
      facilitatorClient
    ).register(
      "eip155:8453",
      new ExactEvmScheme()
    );

    const paymentMw = paymentMiddleware(
      {
        [`GET ${routePath}`]: {
          accepts: [
            {
              scheme: "exact",
              price: config.price,
              network: "eip155:8453",
              payTo: c.env.PAY_TO as `0x${string}`,
            },
          ],
          description: config.description,
          mimeType: "application/json",
        },
      },
      resourceServer
    );

    return await requirePaymentOrCookie(paymentMw)(c, next);
  };
}
