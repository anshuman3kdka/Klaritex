import { PDFParse } from "pdf-parse";

export async function extractPdfText(fileBuffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: fileBuffer });
  try {
    const result = await parser.getText();
    const extracted = (result.text ?? "").trim();
    return extracted.slice(0, 10000);
  } finally {
    await parser.destroy();
  }
}
