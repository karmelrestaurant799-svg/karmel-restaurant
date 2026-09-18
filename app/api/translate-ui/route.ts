import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const DEEPL_ENDPOINT = DEEPL_API_KEY?.endsWith(":fx")
  ? "https://api-free.deepl.com/v2/translate"
  : "https://api.deepl.com/v2/translate";

const LANG_CODE_MAP: Record<string, string> = {
  en: "EN-US",
  es: "ES",
  fr: "FR",
  it: "IT",
  nl: "NL",
  tr: "TR",
  pl: "PL",
  ru: "RU",
  ar: "AR",
  zh: "ZH",
  ja: "JA",
};

const SKIP_KEYS = new Set(["id", "holidays"]);

type LeafPath = string[];

function flatten(obj: unknown, path: LeafPath = [], out: { path: LeafPath; text: string }[] = []): { path: LeafPath; text: string }[] {
  if (typeof obj === "string") {
    if (obj.trim() !== "") {
      out.push({ path, text: obj });
    }
  } else if (Array.isArray(obj)) {
    if (path[path.length - 1] === "images") return out;
    if (path[path.length - 1] === "holidays") return out;

    obj.forEach((item, i) => flatten(item, [...path, String(i)], out));
  } else if (obj && typeof obj === "object") {
    for (const key in obj) {
      if (SKIP_KEYS.has(key)) continue;
      flatten((obj as Record<string, unknown>)[key], [...path, key], out);
    }
  }
  return out;
}

function unflatten(
  template: unknown,
  translatedTexts: Map<string, string>,
  path: LeafPath = []
): unknown {
  if (typeof template === "string") {
    if (template.trim() === "") return template;
    return translatedTexts.get(path.join(".")) ?? template;
  } else if (Array.isArray(template)) {
    if (path[path.length - 1] === "images") return template;
    if (path[path.length - 1] === "holidays") return template;
    return template.map((item, i) => unflatten(item, translatedTexts, [...path, String(i)]));
  } else if (template && typeof template === "object") {
    const result: Record<string, unknown> = {};
    for (const key in template) {
      result[key] = unflatten((template as Record<string, unknown>)[key], translatedTexts, [...path, key]);
    }
    return result;
  }
  return template;
}

const translateUiSchema = z.object({
  targetLang: z.enum(["en", "es", "fr", "it", "nl", "tr", "pl", "ru", "ar", "zh", "ja"]),
  sourceDict: z.record(z.unknown()).refine(
    (dict) => JSON.stringify(dict).length < 100000,
    "Source dictionary too large (max 100KB)"
  ),
});

export async function POST(req: NextRequest) {

  try {
    if (!DEEPL_API_KEY) {
      return NextResponse.json({ error: "Translation service not configured" }, { status: 503 });
    }

    const body = await req.json();
    const parsed = translateUiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { targetLang, sourceDict } = parsed.data;

    // 1. Check database cache first (graceful fallback if DB unavailable)
    let cached: { data: Prisma.JsonValue } | null = null;
    try {
      cached = await prisma.translation.findUnique({
        where: { lang: targetLang },
      });
    } catch (dbError) {
      console.warn("[Translation] Database unavailable, skipping cache:", dbError);
    }

    if (cached?.data) {
      console.log(`[Translation] Cache hit for ${targetLang}`);
      return NextResponse.json({ success: true, translatedDict: cached.data, cached: true }, { status: 200 });
    }

    console.log(`[Translation] Cache miss for ${targetLang}, calling DeepL...`);

    const deeplLang = LANG_CODE_MAP[targetLang];
    if (!deeplLang) {
      return NextResponse.json(
        { error: `Language "${targetLang}" is not supported by DeepL` },
        { status: 400 }
      );
    }

    const leaves = flatten(sourceDict);
    const texts = leaves.map((l) => l.text);

    const CHUNK_SIZE = 50;
    const translatedTexts: string[] = [];

    for (let i = 0; i < texts.length; i += CHUNK_SIZE) {
      const chunk = texts.slice(i, i + CHUNK_SIZE);
      const res = await fetch(DEEPL_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: chunk, target_lang: deeplLang, source_lang: "DE" }),
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("DeepL Error:", errText);
        return NextResponse.json({ error: `Translation service error: ${res.status}` }, { status: 502 });
      }

      const data = await res.json();
      translatedTexts.push(...data.translations.map((t: { text: string }) => t.text));
    }

    const translatedMap = new Map<string, string>();
    leaves.forEach((leaf, i) => translatedMap.set(leaf.path.join("."), translatedTexts[i]));

    const translatedDict = unflatten(sourceDict, translatedMap);

    // 2. Save to database cache
    try {
      await prisma.translation.upsert({
        where: { lang: targetLang },
        update: { data: translatedDict as Prisma.JsonObject },
        create: { lang: targetLang, data: translatedDict as Prisma.JsonObject },
      });
      console.log(`[Translation] Cached ${targetLang} to database`);
    } catch (cacheError) {
      console.error("[Translation] Failed to cache:", cacheError);
      // Non-blocking - translation still works
    }

    return NextResponse.json({ success: true, translatedDict, cached: false }, { status: 200 });
  } catch (error: unknown) {
    console.error("Translation Pipeline Error:", error);
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}