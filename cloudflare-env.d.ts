interface Fetcher {
  fetch(input: Request | URL | string, init?: RequestInit): Promise<Response>;
}

interface D1Database {
  readonly __cloudflareD1DatabaseBrand?: never;
}

declare module "cloudflare:workers" {
  export const env: {
    DB?: D1Database;
    LEADS_SERVICE_URL?: string;
    LEADS_API_KEY?: string;
    [key: string]: unknown;
  };
}
