import PDFDocument from "pdfkit";
import { uploadBuffer } from "./cloudinaryStorage.js";

export const createReportPdfBuffer = (report) =>
  new Promise((resolve, reject) => {
    const document = new PDFDocument({ margin: 50 });
    const chunks = [];
    document.on("data", (chunk) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);

    document
      .fontSize(22)
      .fillColor("#0d5c63")
      .text("BloodCare", { continued: false });
    document
      .moveDown()
      .fontSize(16)
      .fillColor("#123b40")
      .text("Diagnostic Report");
    document
      .moveDown()
      .fontSize(10)
      .fillColor("#555")
      .text(`Report ID: ${report._id}`)
      .text(`Approval status: ${report.status}`)
      .text(
        `Approved by: ${report.approvedBy?.name || "BloodCare administrator"}`,
      );
    document
      .moveDown()
      .fontSize(11)
      .fillColor("#333")
      .text(`Patient: ${report.patient?.name || "Patient"}`);
    const reportTests = report.tests?.length ? report.tests : [report.test];
    document.text(
      `Tests: ${reportTests
        .map((test) => `${test?.name || "Diagnostic test"} (${test?.code || "N/A"})`)
        .join(", ")}`,
    );
    document.text(`Technician: ${report.technician?.name || "Technician"}`);
    document.text(
      `Sample ID: ${report.appointment?.sampleId || "Not available"}`,
    );
    document.text(`Report date: ${report.createdAt.toLocaleDateString()}`);
    document.text(
      `Approved: ${report.approvedAt?.toLocaleDateString() || "Approved"}`,
    );
    document.moveDown();
    report.results.forEach((result) => {
      document.text(
        `${result.marker}: ${result.value} ${result.unit || ""} | ${result.flag} | Reference: ${result.referenceRange || "N/A"} | Remarks: ${result.remarks || "N/A"}`,
      );
    });
    document.moveDown().text(`Interpretation: ${report.interpretation}`);
    if (report.remarks) document.text(`Remarks: ${report.remarks}`);
    document.end();
  });

export const uploadReportPdf = async (report) => {
  const buffer = await createReportPdfBuffer(report);
  const uploaded = await uploadBuffer(buffer, {
    folder: "healthcare/reports",
    publicId: `report-${report._id}`,
    format: "pdf",
    resourceType: "raw",
  });
  return { ...uploaded, format: "pdf", resourceType: "raw" };
};
