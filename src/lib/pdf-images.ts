import fs from "fs";
import zlib from "zlib";

export type PdfImage = {
  index: number;
  bytes: Buffer;
  ext: "jpg" | "png";
  mimeType: string;
  width: number;
  height: number;
};

const MAX_IMAGES = 40;
const MIN_EDGE = 120;
const MIN_AREA = 20000;

/**
 * Yuklenen PDF raporlarindan gomulu raster gorselleri (XObject) cikarir.
 * - DCTDecode akislari dogrudan JPEG olarak kaydedilir.
 * - FlateDecode (RGB/gri, predictor'siz) akislari sharp ile PNG'ye donusturulur.
 * - Vektor cizimler, JPX, predictor'lu ve CMYK akislar sessizce atlanir.
 * - Bir RGB gorselle ayni boyuttaki gri akis SMask (alfa maskesi) kabul edilip atlanir.
 */
export async function extractPdfImages(filePath: string): Promise<PdfImage[]> {
  let buf: Buffer;
  try {
    buf = fs.readFileSync(filePath);
  } catch {
    return [];
  }
  const lat = buf.toString("latin1");
  const objRe = /(\d+)\s+(\d+)\s+obj([\s\S]*?)endobj/g;
  const out: PdfImage[] = [];
  let index = 0;
  let prevDims = "";
  let match: RegExpExecArray | null;

  let sharpLib: typeof import("sharp") | null | undefined;

  while ((match = objRe.exec(lat))) {
    if (out.length >= MAX_IMAGES) break;
    const body = match[3];
    if (!/\/Subtype\s*\/Image/.test(body)) continue;

    const width = Number((body.match(/\/Width\s+(\d+)/) || [])[1] || 0);
    const height = Number((body.match(/\/Height\s+(\d+)/) || [])[1] || 0);
    if (!width || !height) continue;
    if (/\/Predictor\b/.test(body)) continue;

    const filter = (body.match(/\/Filter\s*(\/[A-Za-z0-9]+|\[[^\]]*\])/) || [])[1] || "";
    const colorSpace = (body.match(/\/ColorSpace\s*(\/[A-Za-z]+|\[[^\]]*\])/) || [])[1] || "";

    const streamKw = lat.indexOf("stream", match.index);
    if (streamKw < 0) continue;
    let dataStart = streamKw + "stream".length;
    if (lat[dataStart] === "\r") dataStart++;
    if (lat[dataStart] === "\n") dataStart++;
    const endStream = buf.indexOf("endstream", dataStart, "latin1");
    if (endStream < 0) continue;
    let raw = buf.subarray(dataStart, endStream);
    while (raw.length && (raw[raw.length - 1] === 0x0a || raw[raw.length - 1] === 0x0d)) {
      raw = raw.subarray(0, raw.length - 1);
    }
    if (!raw.length) continue;

    const dims = `${width}x${height}`;
    const isGray = /DeviceGray/.test(colorSpace);
    index += 1;

    try {
      if (/DCTDecode/.test(filter)) {
        if (raw[0] !== 0xff || raw[1] !== 0xd8) continue; // gecerli JPEG degil
        out.push({ index, bytes: Buffer.from(raw), ext: "jpg", mimeType: "image/jpeg", width, height });
        prevDims = dims;
        continue;
      }
      if (/JPXDecode|CCITTFaxDecode|JBIG2Decode/.test(filter)) continue;

      if (/FlateDecode/.test(filter)) {
        // RGB gorselin hemen ardindan gelen ayni boyutlu gri akis = SMask, atla.
        if (isGray && dims === prevDims) continue;
        const inflated = zlib.inflateSync(raw);
        let channels: 1 | 3 | 0 = 0;
        if (inflated.length === width * height * 3) channels = 3;
        else if (inflated.length === width * height) channels = 1;
        if (channels === 0) continue; // CMYK / beklenmeyen duzen
        if (isGray && channels === 1 && dims === prevDims) continue;

        if (sharpLib === undefined) {
          try {
            sharpLib = (await import("sharp")).default as unknown as typeof import("sharp");
          } catch {
            sharpLib = null;
          }
        }
        if (!sharpLib) continue;
        const png = await sharpLib(inflated, { raw: { width, height, channels } })
          .png({ compressionLevel: 8 })
          .toBuffer();
        out.push({ index, bytes: png, ext: "png", mimeType: "image/png", width, height });
        prevDims = dims;
      }
    } catch {
      // bozuk/desteklenmeyen akis - atla
    }
  }

  return out.filter((img) => Math.min(img.width, img.height) >= MIN_EDGE && img.width * img.height >= MIN_AREA);
}
