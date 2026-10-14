// Extraction documentaire (carte grise / permis de conduire) via l'AI Gateway.
// Ce module est server-only : il lit LOVABLE_API_KEY et n'est jamais importé par le client.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

type AiConfig = {
  url: string;
  model: string;
  apiKey: string;
  maxTokens?: number;
  reasoningEffort?: string;
  responseFormat?: "json_object";
};

const LOVABLE_PROVIDER = "lovable";
const OPENAI_COMPATIBLE_PROVIDER = "openai-compatible";
const DEFAULT_TIMEOUT_MS = 120000;
const DEFAULT_MAX_TOKENS = 1024;
const DEFAULT_REASONING_EFFORT = "none";

const requestTimeoutMs = (() => {
  const raw = process.env["AI_TIMEOUT_MS"]?.trim();
  if (!raw) return DEFAULT_TIMEOUT_MS;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_TIMEOUT_MS;
})();

// Options de génération appliquées UNIQUEMENT au fournisseur local
// (openai-compatible). Elles ne sont jamais envoyées à Lovable Cloud.
const aiMaxTokens = (() => {
  const raw = process.env["AI_MAX_TOKENS"]?.trim();
  if (!raw) return DEFAULT_MAX_TOKENS;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_TOKENS;
})();

const aiReasoningEffort = (() => {
  const raw = process.env["AI_REASONING_EFFORT"]?.trim().toLowerCase();
  if (["none", "low", "medium", "high"].includes(raw ?? "")) return raw as "none" | "low" | "medium" | "high";
  return DEFAULT_REASONING_EFFORT;
})();

/** Sélection du fournisseur IA selon l'environnement.
 * Mode par défaut (Lovable Cloud) : LOVABLE_API_KEY + AI Gateway.
 * Mode local (bun run dev) : AI_PROVIDER=openai-compatible avec AI_BASE_URL / AI_MODEL / AI_API_KEY.
 * Les clés ne sont jamais lues côté client et ne sont jamais loguées. */
function resolveAiConfig(): AiConfig {
  const provider = (process.env["AI_PROVIDER"] ?? LOVABLE_PROVIDER).trim().toLowerCase();
  if (provider === OPENAI_COMPATIBLE_PROVIDER) {
    const url = process.env["AI_BASE_URL"]?.trim();
    const model = process.env["AI_MODEL"]?.trim();
    const apiKey = process.env["AI_API_KEY"]?.trim();
    if (!url || !model || !apiKey) {
      throw new Error(
        "AI_PROVIDER=openai-compatible requiert AI_BASE_URL, AI_MODEL et AI_API_KEY",
      );
    }
    return {
      url: `${url.replace(/\/+$/, "")}/chat/completions`,
      model,
      apiKey,
      maxTokens: aiMaxTokens,
      reasoningEffort: aiReasoningEffort,
      responseFormat: "json_object",
    };
  }
  if (provider !== LOVABLE_PROVIDER) {
    throw new Error(
      `AI_PROVIDER inconnu : "${provider}" (attendu : "${LOVABLE_PROVIDER}" ou "${OPENAI_COMPATIBLE_PROVIDER}")`,
    );
  }
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("LOVABLE_API_KEY indisponible");
  return { url: GATEWAY_URL, model: MODEL, apiKey };
}

const REGISTRATION_PROMPT = `Tu analyses la photo ou le scan d'une carte grise française (certificat d'immatriculation).
Renvoie STRICTEMENT un JSON avec ces clés (chaîne vide si absent) :
{
  "plate": "champ A — immatriculation",
  "brand": "champ D.1 — marque",
  "model": "champ D.3 ou D.2 — dénomination commerciale / modèle",
  "vin": "champ E — numéro d'identification (VIN)",
  "firstRegistration": "champ B — date de 1re immatriculation au format YYYY-MM-DD",
  "nomenclature": "champ D.2 — code national d'identification du type (n° de nomenclature)",
  "formulaNumber": "champ I — numéro de formule",
  "ptac": "champ F.2 — poids total autorisé en charge en kg, nombre entier",
  "emptyWeight": "champ G.1 — poids à vide / hors charge en kg, nombre entier",
  "power": "champ P.6 — puissance administrative en CV, nombre entier",
  "powerKw": "champ P.2 — puissance nette maximale en kW, nombre entier",
  "seats": "champ S.1 — nombre de places assises, nombre entier",
  "co2": "champ V.7 — émissions CO2 en g/km, nombre entier",
  "body": "champ J.1 — carrosserie",
  "energy": "champ P.3 — une valeur parmi Diesel, Essence, Hybride, Électrique",
  "category": "VP, VU ou 2ROUES selon le champ J / J.1"
}
Aucun texte hors du JSON.`;

const LICENSE_PROMPT = `Tu analyses la photo ou le scan d'un permis de conduire français (et si présent le justificatif d'adresse).
Renvoie STRICTEMENT un JSON avec ces clés (chaîne vide si absent) :
{
  "firstName": "prénom",
  "lastName": "nom",
  "birthDate": "date de naissance YYYY-MM-DD",
  "licenseNumber": "numéro de permis (champ 5)",
  "licenseCategories": "catégories obtenues, séparées par des virgules",
  "licenseIssuedAt": "date de délivrance YYYY-MM-DD",
  "licenseExpiry": "date de fin de validité YYYY-MM-DD",
  "street": "numéro et libellé de voie si visible",
  "postalCode": "code postal si visible",
  "city": "ville si visible"
}
Aucun texte hors du JSON.`;

const FUEL_PROMPT = `Tu analyses une facture ou un relevé de carburant / péage (DKV, TotalEnergies, Shell, AS24, Ulys...).
Renvoie STRICTEMENT un JSON avec ces clés (chaîne vide si absent) :
{
  "supplier": "émetteur : DKV, TotalEnergies, Ulys, Shell...",
  "invoiceNumber": "numéro de facture ou de relevé",
  "cardNumber": "numéro de carte carburant ou badge utilisé (chiffres uniquement, sans espaces)",
  "plate": "immatriculation du véhicule si mentionnée, format AA-123-AA",
  "date": "date de transaction ou de facture YYYY-MM-DD",
  "category": "carburant ou peages",
  "liters": "volume total en litres, nombre décimal avec point",
  "amountHt": "montant total HT, nombre décimal avec point",
  "amountTtc": "montant total TTC, nombre décimal avec point"
}
Aucun texte hors du JSON.`;

export type ScanKind = "carte_grise" | "permis" | "facture_carburant";

export async function extractDocument(kind: ScanKind, dataUrls: string[]) {
  const { url, model, apiKey, maxTokens, reasoningEffort, responseFormat } = resolveAiConfig();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        ...(maxTokens ? { max_tokens: maxTokens } : {}),
        ...(reasoningEffort ? { reasoning_effort: reasoningEffort } : {}),
        ...(responseFormat ? { response_format: { type: responseFormat } } : {}),
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: kind === "carte_grise" ? REGISTRATION_PROMPT : kind === "permis" ? LICENSE_PROMPT : FUEL_PROMPT },
              ...dataUrls.map((dataUrl) => ({ type: "image_url" as const, image_url: { url: dataUrl } })),
            ],
          },
        ],
      }),
      signal: controller.signal,
    });

  if (response.status === 429) throw new Error("Limite de requêtes atteinte, réessayez dans un instant.");
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Analyse impossible (${response.status}) ${detail.slice(0, 200)}`);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string }; finish_reason?: string }[];
  };
  if (payload.choices?.[0]?.finish_reason === "length") {
    throw new Error(
      `Réponse tronquée par max_tokens (${aiMaxTokens}) — augmentez AI_MAX_TOKENS ou diminuez la taille du document.`,
    );
  }
  const raw = payload.choices?.[0]?.message?.content ?? "";
  return parseJsonBlock(raw);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(
        `Analyse trop longue (>${requestTimeoutMs / 1000}s) — le document est trop volumineux ou le modèle local ne répond plus.`,
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function parseJsonBlock(raw: string): Record<string, string> {
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Réponse illisible du modèle");
  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
  const out: Record<string, string> = {};
  Object.entries(parsed).forEach(([key, value]) => {
    out[key] = value === null || value === undefined ? "" : String(value);
  });
  return out;
}
