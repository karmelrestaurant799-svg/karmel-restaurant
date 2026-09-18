import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const DEEPL_ENDPOINT = DEEPL_API_KEY?.endsWith(":fx")
  ? "https://api-free.deepl.com/v2/translate"
  : "https://api.deepl.com/v2/translate";

const translateSchema = z.object({
  text: z.string().min(1).max(5000).transform((s) => s.trim()),
  targetLang: z.enum(["en", "de", "es", "fr", "it", "nl", "tr", "pl", "ru", "ar", "zh", "ja"]),
});

export async function POST(req: NextRequest) {

  try {
    // Previously this only checked the secret *if* INTERNAL_API_SECRET was set, so with it
    // unset (it isn't in .env.example) the route was an open, unmetered proxy to the paid
    // DeepL account. Nothing in the app calls it; require the secret or an admin session.
    const secret = process.env.INTERNAL_API_SECRET;
    const hasSecret = !!secret && req.headers.get("x-internal-secret") === secret;
    if (!hasSecret) {
      const session = await auth();
      if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized request" }, { status: 401 });
      }
    }

    const body = await req.json();
    const parsed = translateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { text, targetLang } = parsed.data;

    if (!DEEPL_API_KEY) {
      return NextResponse.json({ error: "Translation service not configured" }, { status: 503 });
    }

    const deeplTargetLang = targetLang.toUpperCase() === "EN" ? "EN-US" : targetLang.toUpperCase();

    const response = await fetch(DEEPL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: [text], target_lang: deeplTargetLang, source_lang: "DE" }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("DeepL Admin Translation Error:", errText);
      return NextResponse.json({ error: "Translation service unavailable" }, { status: 502 });
    }

    const data = await response.json();
    const translatedText = data.translations[0]?.text || text;

    return NextResponse.json({ success: true, translatedText }, { status: 200 });
  } catch (error: unknown) {
    console.error("Translate API Error:", error);
    return NextResponse.json(
      { error: "Failed to translate" },
      { status: 500 }
    );
  }
}