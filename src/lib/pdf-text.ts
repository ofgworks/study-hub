import fs from "fs";

/**
 * PDF metnini `unpdf` (pdfjs tabanli) ile dogru sekilde cikarir.
 * - Subset/ozel kodlamali fontlar ToUnicode CMap uzerinden cozuldugu icin
 *   Turkce karakterler (s,g,i,c,o,u + buyuk harfleri) dogru gelir.
 * - Satir sonu tirelemeleri ("süre- cinde") birlestirilir.
 * - Cikarim basarisiz olursa cagiran taraf eski ham yontemine donebilsin diye
 *   bos string doner.
 */
export async function extractPdfText(filePath: string): Promise<string> {
  try {
    const buffer = fs.readFileSync(filePath);
    const { getDocumentProxy, extractText } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return cleanPdfText(Array.isArray(text) ? text.join("\n") : text);
  } catch (error) {
    console.error("PDF text extraction (unpdf) failed", error);
    return "";
  }
}

function cleanPdfText(text: string): string {
  return text
    // satir sonu tirelemesini birlestir: "süre- cinde" -> "sürecinde"
    .replace(/([a-zçğıöşü])-\s+([a-zçğıöşü])/g, "$1$2")
    // icindekiler nokta liderlerini sadelestir
    .replace(/\.{4,}/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 120000);
}
