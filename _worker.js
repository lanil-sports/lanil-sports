// Cloudflare Worker for LANILSPORTS.COM
// - Serves static assets from the attached assets directory.
// - Proxies /api/* requests to the LANIL backend (server.js) via BACKEND_URL.
//
// Deploy: set BACKEND_URL (e.g. https://lanil-backend.example.com) via
// `wrangler secret put BACKEND_URL` or the dashboard, then `wrangler deploy`.

const DEFAULT_BACKEND = "http://127.0.0.1:3000";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      const backendOrigin = (env.BACKEND_URL || DEFAULT_BACKEND).replace(/\/+$/, "");
      const target = backendOrigin + url.pathname + url.search;

      const headers = new Headers();
      const ct = request.headers.get("content-type");
      if (ct) headers.set("content-type", ct);
      const hasBody = !["GET", "HEAD"].includes(request.method);
      const body = hasBody ? await request.arrayBuffer() : undefined;

      const upstream = new Request(target, {
        method: request.method,
        headers,
        body,
        redirect: "manual",
      });

      const upstreamRes = await fetch(upstream);
      const payload = await upstreamRes.arrayBuffer();

      return new Response(payload, {
        status: upstreamRes.status,
        headers: {
          "content-type": upstreamRes.headers.get("content-type") || "application/json",
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
