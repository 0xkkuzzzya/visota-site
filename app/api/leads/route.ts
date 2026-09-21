type LeadPayload = {
  name?: unknown;
  phone?: unknown;
  tariff?: unknown;
};

type TelegramEnv = {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  TELEGRAM_API_BASE_URL?: string;
};

type TelegramResponse = {
  ok?: boolean;
  description?: string;
};

const phonePattern = /^[0-9+()\-\s]+$/;
const telegramTokenPattern = /^[A-Za-z0-9:_-]+$/;
const telegramChatPattern = /^(?:-?\d+|@[A-Za-z0-9_]{5,32})$/;
const allowedTariffs = new Set(["Стандарт", "Премиум", "Широкие"]);

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function firstForwardedValue(value: string | null) {
  return value?.split(",", 1)[0]?.trim() || "";
}

function hasAllowedOrigin(request: Request) {
  const rawOrigin = request.headers.get("origin");
  if (!rawOrigin) return true;

  try {
    const origin = new URL(rawOrigin);
    if (origin.protocol !== "http:" && origin.protocol !== "https:") return false;

    const publicHost =
      firstForwardedValue(request.headers.get("x-forwarded-host")) ||
      firstForwardedValue(request.headers.get("host")) ||
      new URL(request.url).host;

    return origin.host.toLowerCase() === publicHost.toLowerCase();
  } catch {
    return false;
  }
}

async function getRuntimeConfig(): Promise<TelegramEnv> {
  let bindings: TelegramEnv = {};

  try {
    const cloudflare = await import("cloudflare:workers");
    bindings = cloudflare.env as unknown as TelegramEnv;
  } catch {
    // Node-based deployments expose secrets through process.env.
  }

  return {
    TELEGRAM_BOT_TOKEN: bindings.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: bindings.TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID,
    TELEGRAM_API_BASE_URL: bindings.TELEGRAM_API_BASE_URL || process.env.TELEGRAM_API_BASE_URL,
  };
}

function normalizePayload(payload: LeadPayload) {
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
  const tariff = typeof payload.tariff === "string" ? payload.tariff.trim() : null;

  if (name.length < 2 || name.length > 100) return null;
  if (phone.length < 5 || phone.length > 30 || !phonePattern.test(phone)) return null;
  if ((phone.match(/\d/g) ?? []).length < 5) return null;
  if (tariff && !allowedTariffs.has(tariff)) return null;

  return { name, phone, tariff: tariff || null };
}

function normalizeTelegramChatId(value?: string) {
  const chatId = value?.trim() || "";

  // Some hosting panels strip a leading minus from environment values.
  // Leads are delivered to a Telegram group, whose numeric ID must be negative.
  if (/^\d+$/.test(chatId)) return `-${chatId}`;
  if (telegramChatPattern.test(chatId)) return chatId;
  return "";
}

function getTelegramEndpoint(token: string, apiBaseUrl?: string) {
  if (!telegramTokenPattern.test(token)) {
    throw new Error("Invalid Telegram token");
  }

  const endpoint = new URL(apiBaseUrl || "https://api.telegram.org");
  const isLocalHttp =
    endpoint.protocol === "http:" &&
    ["localhost", "127.0.0.1", "::1"].includes(endpoint.hostname);

  if (endpoint.protocol !== "https:" && !isLocalHttp) {
    throw new Error("Unsupported Telegram API protocol");
  }

  const basePath = endpoint.pathname.replace(/\/+$/, "");
  endpoint.pathname = `${basePath}/bot${token}/sendMessage`;
  endpoint.search = "";
  endpoint.hash = "";
  return endpoint;
}

function buildTelegramMessage(lead: NonNullable<ReturnType<typeof normalizePayload>>) {
  return [
    "🔔 Новая заявка с сайта",
    "",
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    `Тариф: ${lead.tariff || "не выбран"}`,
  ].join("\n");
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > 4096) {
    return jsonError("Слишком большой запрос", 413);
  }

  if (!hasAllowedOrigin(request)) {
    return jsonError("Запрос отклонён", 403);
  }

  let input: LeadPayload;

  try {
    input = await request.json() as LeadPayload;
  } catch {
    return jsonError("Некорректные данные заявки", 400);
  }

  const lead = normalizePayload(input);

  if (!lead) {
    return jsonError("Проверьте имя и номер телефона", 400);
  }

  const {
    TELEGRAM_BOT_TOKEN: rawToken,
    TELEGRAM_CHAT_ID: rawChatId,
    TELEGRAM_API_BASE_URL: apiBaseUrl,
  } = await getRuntimeConfig();
  const token = rawToken?.trim() || "";
  const chatId = normalizeTelegramChatId(rawChatId);

  if (!token || !chatId) {
    return jsonError("Сервис заявок временно недоступен", 503);
  }

  let endpoint: URL;

  try {
    endpoint = getTelegramEndpoint(token, apiBaseUrl);
  } catch {
    return jsonError("Сервис заявок временно недоступен", 503);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildTelegramMessage(lead),
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
    });
    const result = await response.json().catch(() => ({})) as TelegramResponse;

    if (!response.ok || result.ok !== true) {
      console.error("Telegram rejected a lead", {
        status: response.status,
        description: result.description || "Unknown Telegram API error",
      });
      return jsonError("Не удалось передать заявку", 502);
    }

    return Response.json({ status: "accepted" }, { status: 201 });
  } catch (error) {
    console.error("Telegram request failed", {
      reason: error instanceof Error ? error.name : "Unknown error",
    });
    return jsonError("Не удалось передать заявку", 502);
  } finally {
    clearTimeout(timeout);
  }
}
