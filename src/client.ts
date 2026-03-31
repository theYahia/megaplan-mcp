const TIMEOUT = 15_000;
const MAX_RETRIES = 3;

let cachedToken: string | null = null;

function getDomain(): string {
  const domain = process.env.MEGAPLAN_DOMAIN;
  if (!domain) throw new Error("MEGAPLAN_DOMAIN is not set");
  return domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function getBaseUrl(): string {
  return `https://${getDomain()}/api/v3`;
}

async function authenticate(): Promise<string> {
  const login = process.env.MEGAPLAN_LOGIN;
  const password = process.env.MEGAPLAN_PASSWORD;
  if (!login || !password) {
    throw new Error("Either MEGAPLAN_TOKEN or (MEGAPLAN_LOGIN + MEGAPLAN_PASSWORD) must be set");
  }

  const response = await fetch(`https://${getDomain()}/api/v3/auth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      username: login,
      password: password,
      grant_type: "password",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Megaplan auth failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as { access_token?: string; data?: { access_token?: string } };
  const token = data.access_token ?? data.data?.access_token;
  if (!token) throw new Error("Megaplan auth: no access_token in response");
  return token;
}

async function getToken(): Promise<string> {
  const envToken = process.env.MEGAPLAN_TOKEN;
  if (envToken) return envToken;

  if (cachedToken) return cachedToken;

  cachedToken = await authenticate();
  return cachedToken;
}

export async function megaplanGet(path: string, params?: Record<string, string>): Promise<unknown> {
  const query = params ? `?${new URLSearchParams(params).toString()}` : "";
  return megaplanRequest("GET", `${path}${query}`);
}

export async function megaplanPost(path: string, body: unknown): Promise<unknown> {
  return megaplanRequest("POST", path, body);
}

async function megaplanRequest(method: string, path: string, body?: unknown): Promise<unknown> {
  const token = await getToken();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(`${getBaseUrl()}${path}`, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.status === 401 && cachedToken) {
        // Token expired, re-authenticate
        cachedToken = null;
        const newToken = await getToken();
        if (newToken !== token) {
          continue; // Retry with new token
        }
      }

      if (response.ok) return response.json();

      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        console.error(`[megaplan-mcp] ${response.status}, retry in ${delay}ms (${attempt}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      const text = await response.text();
      throw new Error(`Megaplan HTTP ${response.status}: ${text}`);
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof DOMException && error.name === "AbortError" && attempt < MAX_RETRIES) {
        console.error(`[megaplan-mcp] Timeout, retry (${attempt}/${MAX_RETRIES})`);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Megaplan: all retries exhausted");
}
