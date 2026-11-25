require("dotenv").config();

const http = require("http");
const fs = require("fs");
const path = require("path");
const Stripe = require("stripe");

const PORT = Number(process.env.PORT || 3000);
const SITE_URL = process.env.SITE_URL || "https://lanilsports.com";
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".csv": "text/csv",
  ".md": "application/octet-stream",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".zip": "application/zip",
  ".svg": "image/svg+xml",
};

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function getPlanConfig(plan) {
  const map = {
    athlete: {
      price: process.env.STRIPE_PRICE_ATHLETE,
      planType: "athlete",
      mode: "subscription",
      name: "LANIL Athlete Premium",
    },
    recruiter: {
      price: process.env.STRIPE_PRICE_RECRUITER,
      planType: "recruiter",
      mode: "subscription",
      name: "LANIL Recruiter & Media Pro",
    },
    sponsor: {
      price: process.env.STRIPE_PRICE_SPONSOR,
      planType: "sponsor",
      mode: "subscription",
      name: "LANIL Parish Sponsorship",
    },
  };
  return map[plan] || null;
}

async function supabaseRequest(method, tablePath, body, prefer) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
  if (prefer) headers.Prefer = prefer;
  const resp = await fetch(`${url}/rest/v1/${tablePath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await resp.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { ok: resp.ok, status: resp.status, data, text };
}

async function handleCheckoutSession(req, res) {
  if (!stripe) return sendJson(res, 500, { error: "Stripe is not configured (missing STRIPE_SECRET_KEY)." });
  let payload;
  try {
    payload = JSON.parse((await readBody(req)).toString("utf8") || "{}");
  } catch {
    return sendJson(res, 400, { error: "Invalid JSON body." });
  }

  const plan = String(payload.plan || "").toLowerCase();
  const config = getPlanConfig(plan);
  if (!config) return sendJson(res, 400, { error: "Invalid plan." });
  if (!config.price) return sendJson(res, 500, { error: `Missing Stripe price ID for ${plan}. Run scripts/setup_stripe_products.js.` });

  const email = String(payload.email || "").trim();
  const athleteId = String(payload.athleteId || "").trim();
  const athleteName = String(payload.athleteName || "").trim();

  if (!email) return sendJson(res, 400, { error: "Email is required." });
  if (plan === "athlete" && !athleteId) return sendJson(res, 400, { error: "athleteId is required for athlete plan." });

  const metadata = {
    plan: config.planType,
    user_email: email,
  };
  if (athleteId) metadata.athleteId = athleteId;
  if (athleteName) metadata.athleteName = athleteName;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: config.mode,
      line_items: [{ price: config.price, quantity: 1 }],
      customer_email: email,
      client_reference_id: athleteId || email,
      metadata,
      subscription_data: { metadata },
      success_url: `${SITE_URL}/?checkout=success&plan=${encodeURIComponent(plan)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/?checkout=cancel&plan=${encodeURIComponent(plan)}`,
      allow_promotion_codes: true,
    });
    return sendJson(res, 200, { url: session.url, id: session.id });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return sendJson(res, 500, { error: err.message || "Failed to create checkout session." });
  }
}

async function fulfillCheckoutSession(session) {
  const meta = session.metadata || {};
  const plan = String(meta.plan || "").toLowerCase();
  const athleteId = String(meta.athleteId || session.client_reference_id || "").trim();
  const email = String(meta.user_email || session.customer_details?.email || session.customer_email || "").trim().toLowerCase();
  const stripeCustomerId = session.customer || null;
  const stripeSubscriptionId = session.subscription || null;

  if (plan === "athlete") {
    if (!athleteId) throw new Error("Missing athleteId in athlete checkout metadata.");
    const patch = {
      subscription_tier: "premium",
      is_claimed: true,
      claimed: true,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      tier: "premium",
    };
    // Try by numeric/string id first, then by player_id.
    let resp = await supabaseRequest("PATCH", `athletes?id=eq.${encodeURIComponent(athleteId)}`, patch, "return=minimal");
    if (!resp.ok) {
      console.error("Athlete update by id failed:", resp.status, resp.text);
    }
    // Also try by player_id for safety when id is not UUID.
    const resp2 = await supabaseRequest("PATCH", `athletes?player_id=eq.${encodeURIComponent(athleteId)}`, patch, "return=minimal");
    if (!resp2.ok) {
      console.error("Athlete update by player_id failed:", resp2.status, resp2.text);
    }
    if (!resp.ok && !resp2.ok) throw new Error(`Failed to update athlete ${athleteId}`);
    return;
  }

  if (plan === "recruiter" || plan === "sponsor") {
    if (!email) throw new Error("Missing email for subscription fulfillment.");
    const row = {
      plan_type: plan,
      user_email: email,
      status: "active",
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      stripe_checkout_session_id: session.id,
      updated_at: new Date().toISOString(),
    };
    const resp = await supabaseRequest(
      "POST",
      "subscriptions?on_conflict=plan_type,user_email",
      row,
      "resolution=merge-duplicates,return=minimal"
    );
    if (!resp.ok) throw new Error(`Failed to upsert subscription: ${resp.status} ${resp.text}`);
    return;
  }

  console.warn("Unhandled plan in fulfillment:", plan);
}

async function handleWebhook(req, res) {
  if (!stripe) return sendJson(res, 500, { error: "Stripe is not configured." });
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return sendJson(res, 500, { error: "Missing STRIPE_WEBHOOK_SECRET." });

  const raw = await readBody(req);
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return sendJson(res, 400, { error: `Webhook Error: ${err.message}` });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.payment_status === "paid" || session.status === "complete") {
        await fulfillCheckoutSession(session);
      }
    } else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      const status = sub.status === "active" || sub.status === "trialing" ? "active" : "inactive";
      // Best-effort status sync for recruiter/sponsor subscriptions.
      await supabaseRequest(
        "PATCH",
        `subscriptions?stripe_subscription_id=eq.${encodeURIComponent(sub.id)}`,
        { status, updated_at: new Date().toISOString() },
        "return=minimal"
      );
    }
    return sendJson(res, 200, { received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return sendJson(res, 500, { error: "Webhook handler failed." });
  }
}

function serveStatic(req, res, safePath) {
  const filePath = path.join(__dirname, safePath === "/" ? "index.html" : safePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(__dirname, "index.html"), (err2, indexData) => {
        if (err2) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Not Found");
        } else {
          res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8",
            "X-Frame-Options": "DENY",
            "X-Content-Type-Options": "nosniff",
          });
          res.end(indexData);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || "application/octet-stream";
    const headers = {
      "Content-Type": mime,
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    };

    if (ext === ".pptx") {
      headers["Content-Disposition"] = `attachment; filename="${path.basename(filePath)}"`;
    }
    if (ext === ".zip") headers["Content-Disposition"] = 'attachment; filename="lanil-sports.zip"';
    if (ext === ".xlsx") headers["Content-Disposition"] = 'attachment; filename="LA_High_School_Yearbook_NIL_Directory_2026_2027.xlsx"';
    if (ext === ".docx" || ext === ".md") headers["Content-Disposition"] = `attachment; filename="${path.basename(filePath)}"`;

    res.writeHead(200, headers);
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    let safePath = decodeURIComponent((req.url || "/").split("?")[0]);
    if (safePath === "/bible" || safePath === "/deck") safePath = "/bible.html";
    if (safePath === "/walkthrough") safePath = "/walkthrough.html";
    if (safePath === "/master-blueprint" || safePath === "/blueprint") safePath = "/master-blueprint.html";

    if (req.method === "GET" && safePath === "/api/stripe-config") {
      return sendJson(res, 200, { publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "" });
    }
    if (req.method === "POST" && safePath === "/api/create-checkout-session") {
      return await handleCheckoutSession(req, res);
    }
    if (req.method === "POST" && safePath === "/api/webhook") {
      return await handleWebhook(req, res);
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      return sendJson(res, 404, { error: "Not found" });
    }
    return serveStatic(req, res, safePath);
  } catch (err) {
    console.error("Server error:", err);
    return sendJson(res, 500, { error: "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`LANILSPORTS server active on ${SITE_URL}`);
  if (!stripe) console.warn("STRIPE_SECRET_KEY missing - Stripe endpoints disabled.");
});
