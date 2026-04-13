import { PDFParse } from "pdf-parse";

export async function extractPdfText(fileBuffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: fileBuffer });
  const result = await parser.getText();
  await parser.destroy();
  const extracted = (result.text ?? "").trim();

  return extracted.slice(0, 10000);
}
