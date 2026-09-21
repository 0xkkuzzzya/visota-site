import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import test from "node:test";

async function dispatch(request, bindings = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: handler } = await import(workerUrl.href);

  const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) }, ...bindings };
  const context = { waitUntil() {}, passThroughOnException() {} };

  return typeof handler === "function"
    ? handler(request, env, context)
    : handler.fetch(request, env, context);
}

async function render(path = "/") {
  return dispatch(new Request(`https://vysota.example${path}`, { headers: { accept: "text/html", host: "vysota.example" } }));
}

test("server-renders the complete Vysota landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Высота — натяжные потолки в Екатеринбурге<\/title>/i);
  assert.match(html, /Натяжные потолки/);
  assert.match(html, /Цены на/);
  assert.match(html, /Дизайнерские<\/span>\s*<em>потолки/);
  assert.match(html, /Отзывы/);
  assert.match(html, /Визуализация потолка/);
  assert.match(html, /8 900 208 21 01/);
  assert.match(html, /href="\/privacy"/);
  assert.match(html, /type="checkbox"[^>]*required=""[^>]*name="privacyConsent"/);
  assert.doesNotMatch(html, /\+7 904 549 84 26|\+7 902 274 58 75/);
  for (const address of ["Ландау 2", "Лодыгина 15", "Радищева 43", "Свердлова, 32", "Ткачей, 21", "Коттеджный поселок Урман"]) {
    assert.match(html, new RegExp(address));
  }
  assert.match(html, /https:\/\/vysota\.example\/og\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
  assert.doesNotMatch(html, /href=["']#/i);
});

test("publishes the personal data policy", async () => {
  const response = await render("/privacy");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Политика в отношении обработки персональных данных/);
  assert.match(html, /Сыромолотова, 28а/);
  assert.match(html, /8 900 208 21 01/);
  assert.match(html, /Telegram Bot API в закрытую рабочую группу/);
  assert.match(html, /№ 152-ФЗ/);
});

test("keeps the required interactions and removes starter UI", async () => {
  const [page, css, leadsRoute, packageJson, metrika, layout, privacy] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/api/leads/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/CookieConsent.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/privacy/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /setInterval\([\s\S]*5000/);
  assert.match(page, /history\.replaceState/);
  assert.match(page, /role="slider"/);
  assert.match(page, /setPointerCapture/);
  assert.match(page, /event\.key === "Escape"/);
  assert.match(page, /document\.body\.style\.overflow = "hidden"/);
  assert.match(page, /fetch\("\/api\/leads"/);
  assert.match(page, /openModal\(plan\.name\)/);
  assert.match(leadsRoute, /api\.telegram\.org/);
  assert.match(leadsRoute, /TELEGRAM_BOT_TOKEN/);
  assert.match(leadsRoute, /TELEGRAM_CHAT_ID/);
  assert.doesNotMatch(leadsRoute, /LEADS_SERVICE_URL|LEADS_API_KEY/);
  assert.match(css, /@keyframes review-right/);
  assert.match(css, /@keyframes review-left/);
  assert.match(css, /height:\s*628px/);
  assert.match(page, /reachMetrikaGoal\("lead_success"\)/);
  assert.match(page, /ym-disable-keys/);
  assert.match(metrika, /111044986/);
  assert.match(metrika, /webvisor:\s*true/);
  assert.match(metrika, /initializeYandexMetrika\(\);/);
  assert.match(metrika, /Понятно/);
  assert.doesNotMatch(metrika, /Только необходимые/);
  assert.match(layout, /<CookieConsent \/>/);
  assert.match(privacy, /Яндекс Метрика/);
  assert.doesNotMatch(page, /href=["']#/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
  await access(new URL("../public/og.png", import.meta.url));
  await access(new URL("../public/assets/logo-original.png", import.meta.url));
  await access(new URL("../public/assets/ceiling-1.jpg", import.meta.url));
  await access(new URL("../public/assets/ceiling-2.jpg", import.meta.url));
  for (let index = 1; index <= 6; index += 1) {
    await access(new URL(`../public/assets/1 (${index}).jpg`, import.meta.url));
  }
  await access(new URL("../.env.example", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
});

test("validates lead submissions before sending them to Telegram", async () => {
  const headers = { "content-type": "application/json", origin: "https://vysota.example" };

  const proxied = await dispatch(new Request("http://127.0.0.1:51387/api/leads", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      host: "127.0.0.1:51387",
      origin: "https://vysota.example",
      "x-forwarded-host": "vysota.example",
      "x-forwarded-proto": "https",
    },
    body: JSON.stringify({ name: "И", phone: "123" }),
  }));
  assert.equal(proxied.status, 400);

  const crossOrigin = await dispatch(new Request("https://vysota.example/api/leads", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://attacker.example" },
    body: JSON.stringify({ name: "Иван", phone: "+7 900 000-00-00" }),
  }));
  assert.equal(crossOrigin.status, 403);

  const invalid = await dispatch(new Request("https://vysota.example/api/leads", {
    method: "POST",
    headers,
    body: JSON.stringify({ name: "И", phone: "123" }),
  }));
  assert.equal(invalid.status, 400);

  const unconfigured = await dispatch(new Request("https://vysota.example/api/leads", {
    method: "POST",
    headers,
    body: JSON.stringify({ name: "Иван", phone: "+7 900 000-00-00", tariff: "Премиум" }),
  }));
  assert.equal(unconfigured.status, 503);

  let telegramRequest;
  const telegramApi = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    telegramRequest = {
      method: request.method,
      url: request.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8")),
    };
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: true, result: {} }));
  });

  await new Promise((resolve) => telegramApi.listen(0, "127.0.0.1", resolve));
  const address = telegramApi.address();
  assert.equal(typeof address, "object");

  process.env.TELEGRAM_API_BASE_URL = `http://127.0.0.1:${address.port}`;
  process.env.TELEGRAM_BOT_TOKEN = "123456:test-token";
  // NetAngels may strip the leading minus from environment values.
  process.env.TELEGRAM_CHAT_ID = "100123456789";

  try {
    const accepted = await dispatch(new Request("https://vysota.example/api/leads", {
      method: "POST",
      headers,
      body: JSON.stringify({ name: "Иван", phone: "+7 (900) 000-00-00", tariff: "Премиум" }),
    }));

    assert.equal(accepted.status, 201);
    assert.deepEqual(telegramRequest, {
      method: "POST",
      url: "/bot123456:test-token/sendMessage",
      body: {
        chat_id: "-100123456789",
        text: "🔔 Новая заявка с сайта\n\nИмя: Иван\nТелефон: +7 (900) 000-00-00\nТариф: Премиум",
        disable_web_page_preview: true,
      },
    });
  } finally {
    delete process.env.TELEGRAM_API_BASE_URL;
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
    await new Promise((resolve, reject) => telegramApi.close((error) => error ? reject(error) : resolve()));
  }
});
