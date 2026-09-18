import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const prismaMock = vi.hoisted(() => ({
  translation: { findUnique: vi.fn(), upsert: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const PAYLOAD = `<img src=x onerror="alert(document.cookie)">`;

// DeepL fake: "translates" every string by prefixing it, and records what it was asked to translate.
function fakeDeepL() {
  const sent: string[] = [];
  const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
    const { text } = JSON.parse(init.body as string) as { text: string[] };
    sent.push(...text);
    return new Response(JSON.stringify({ translations: text.map((t) => ({ text: `EN:${t}` })) }), { status: 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
  return { sent, fetchMock };
}

// DEEPL_API_KEY is read when the route module loads, so import it fresh after setting the env.
async function loadRoute() {
  vi.resetModules();
  return (await import("@/app/api/translate-ui/route")).POST;
}

const post = (body: unknown) =>
  new NextRequest("http://localhost/api/translate-ui", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("DEEPL_API_KEY", "test-key:fx");
  prismaMock.translation.findUnique.mockResolvedValue(null);
  prismaMock.translation.upsert.mockResolvedValue({});
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/translate-ui: cache poisoning", () => {
  it("translates the server's own German dictionary and ignores a caller-supplied sourceDict", async () => {
    const { sent } = fakeDeepL();
    const POST = await loadRoute();

    const res = await POST(
      post({
        targetLang: "en",
        // What an attacker would send to plant markup in the shared cache (the /datenschutz page
        // renders this key with dangerouslySetInnerHTML).
        sourceDict: { evil: PAYLOAD, datenschutz: { section10Content: PAYLOAD } },
      })
    );

    expect(res.status).toBe(200);
    // Nothing the caller supplied reaches DeepL...
    expect(sent.join("\n")).not.toContain("onerror");
    // ...but the real German text does.
    expect(sent).toContain("Speichern");

    // Nothing the caller supplied is cached for other visitors, or returned.
    const cached = JSON.stringify(prismaMock.translation.upsert.mock.calls[0][0]);
    expect(cached).not.toContain("onerror");
    expect(cached).toContain("EN:Speichern");
    const body = await res.json();
    expect(JSON.stringify(body)).not.toContain("onerror");
    expect(body.translatedDict.common.save).toBe("EN:Speichern");
  });

  it("still works for the payload the current client sends (just the language)", async () => {
    fakeDeepL();
    const POST = await loadRoute();
    const res = await POST(post({ targetLang: "fr" }));
    expect(res.status).toBe(200);
    expect(prismaMock.translation.upsert).toHaveBeenCalledOnce();
    expect(prismaMock.translation.upsert.mock.calls[0][0].where).toEqual({ lang: "fr" });
  });

  it("serves an existing cache entry without calling DeepL", async () => {
    const { fetchMock } = fakeDeepL();
    prismaMock.translation.findUnique.mockResolvedValue({ data: { common: { save: "Save" } } });
    const POST = await loadRoute();

    const res = await POST(post({ targetLang: "en" }));
    expect(await res.json()).toMatchObject({ cached: true, translatedDict: { common: { save: "Save" } } });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(prismaMock.translation.upsert).not.toHaveBeenCalled();
  });

  it("rejects unsupported languages and malformed bodies with 400", async () => {
    const { fetchMock } = fakeDeepL();
    const POST = await loadRoute();
    expect((await POST(post({ targetLang: "de" }))).status).toBe(400);
    expect((await POST(post({ targetLang: "xx" }))).status).toBe(400);
    expect((await POST(post({}))).status).toBe(400);
    expect((await POST(post("{not json"))).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(prismaMock.translation.upsert).not.toHaveBeenCalled();
  });
});
