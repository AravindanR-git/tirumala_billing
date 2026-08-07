import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const forceBlackText = (root) => root?.querySelectorAll("*").forEach((element) => {
  element.style.color = "#000";
  element.style.webkitTextFillColor = "#000";
});

export async function createReceiptPdf(element, template, fileName = `bill_${Date.now()}.pdf`) {
  forceBlackText(element);
  const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
  const image = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", [template.paperWidthMm, 200]);
  const properties = pdf.getImageProperties(image);
  const height = (properties.height * template.paperWidthMm) / properties.width;
  pdf.addImage(image, "PNG", 0, 0, template.paperWidthMm, height);

  if (!Capacitor.isNativePlatform()) return { pdf, uri: null };
  const bytes = new Uint8Array(pdf.output("arraybuffer"));
  const base64 = btoa(bytes.reduce((text, byte) => text + String.fromCharCode(byte), ""));
  const saved = await Filesystem.writeFile({ path: fileName, data: base64, directory: Directory.External, recursive: true });
  return { pdf, uri: saved.uri };
}

export function printReceiptInBrowser(element, template) {
  const frame = document.createElement("iframe");
  frame.style.display = "none";
  document.body.appendChild(frame);
  const documentForPrint = frame.contentDocument;
  documentForPrint.open();
  documentForPrint.write(`<html><head><style>@page { size: ${template.paperWidthMm}mm auto; margin: 0; } body { margin: 0; font-family: Consolas, monospace; color: #000; } .bill-container { width: ${template.paperWidthMm}mm; padding: ${template.paddingMm}mm; line-height: 1.2; } .bill-container, .bill-container * { color: #000 !important; -webkit-text-fill-color: #000 !important; }</style></head><body>${element.outerHTML}</body></html>`);
  documentForPrint.close();
  window.setTimeout(() => { frame.contentWindow.focus(); frame.contentWindow.print(); frame.remove(); }, 300);
}
