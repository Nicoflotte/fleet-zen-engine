import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Nombre maximal d'images transmises à l'OCR en un appel
// (limite de pages d'un PDF, voir src/lib/pdf-to-images.ts).
export const MAX_OCR_IMAGES = 10;

const schema = z.object({
  kind: z.enum(["carte_grise", "permis", "facture_carburant"]),
  // 1 image (photo/scanned document) ou plusieurs (pages d'un PDF).
  dataUrls: z.array(z.string().min(32)).min(1).max(MAX_OCR_IMAGES),
});

export const scanDocument = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const { extractDocument } = await import("./ocr.server");
    const fields = await extractDocument(data.kind, data.dataUrls);
    return { fields };
  });
