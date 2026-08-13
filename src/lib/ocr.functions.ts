import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  kind: z.enum(["carte_grise", "permis"]),
  dataUrl: z.string().min(32),
});

export const scanDocument = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const { extractDocument } = await import("./ocr.server");
    const fields = await extractDocument(data.kind, data.dataUrl);
    return { fields };
  });
