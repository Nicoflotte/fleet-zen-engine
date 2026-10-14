import { MAX_OCR_IMAGES } from "@/lib/ocr.functions";
import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

// Résolution cible : texte facture lisible tout en limitant la taille des
// images (≈ 108 dpi) pour éviter de saturer la fenêtre de contexte et la VRAM
// des modèles vision locaux comme qwen3-vl:2b-16k.
const BASE_SCALE = 1.5;
// Long côté max en pixels — aucune image ne dépasse cette résolution.
const MAX_DIMENSION = 1052;
const JPEG_QUALITY = 0.8;

export type PdfToImagesResult = {
  dataUrls: string[];
  pageCount: number;
  truncated: boolean;
};

/** Convertit les pages d'un PDF en images JPEG, dans le navigateur uniquement.
 * Les pages au-delà de MAX_OCR_IMAGES ne sont pas rendues : `truncated` le signale
 * pour avertir l'utilisateur (aucune page n'est traitée silencieusement). */
export async function pdfToDataUrls(file: File): Promise<PdfToImagesResult> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const task = pdfjs.getDocument({ data: buffer });
  let pdf: pdfjs.PDFDocumentProxy;
  try {
    pdf = await task.promise;
  } catch {
    await task.destroy();
    throw new Error("PDF illisible ou corrompu");
  }
  try {
    const pageCount = pdf.numPages;
    const pagesToRender = Math.min(pageCount, MAX_OCR_IMAGES);
    const dataUrls: string[] = [];
    for (let pageNumber = 1; pageNumber <= pagesToRender; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const base = page.getViewport({ scale: BASE_SCALE });
      const ratio = Math.min(1, MAX_DIMENSION / Math.max(base.width, base.height));
      const viewport = ratio < 1 ? page.getViewport({ scale: BASE_SCALE * ratio }) : base;
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Canvas 2D indisponible dans ce navigateur");
      }
      try {
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        // Canvas temporaire libéré immédiatement après extraction de l'image.
        dataUrls.push(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      } finally {
        canvas.width = 0;
        canvas.height = 0;
      }
    }
    return { dataUrls, pageCount, truncated: pageCount > pagesToRender };
  } catch (err) {
    if (err instanceof Error && err.message === "PDF illisible ou corrompu") throw err;
    throw new Error("Conversion du PDF en images impossible");
  } finally {
    await task.destroy();
  }
}
