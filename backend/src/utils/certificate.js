const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { UPLOAD_ROOT } = require('./fileUpload');

/**
 * Generates a PDF certificate for course completion.
 * Saves the PDF to /uploads/certificates/<code>.pdf
 * Returns the relative path for DB storage.
 */
const generateCertificate = async ({ studentName, courseTitle, completedAt, verificationCode }) => {
  return new Promise((resolve, reject) => {
    const filename = `${verificationCode}.pdf`;
    const certDir = path.join(UPLOAD_ROOT, 'certificates');
    const filePath = path.join(certDir, filename);

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0f172a');

    // Gold border
    doc
      .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .lineWidth(3)
      .stroke('#f59e0b');

    // Title
    doc
      .fillColor('#f59e0b')
      .fontSize(36)
      .font('Helvetica-Bold')
      .text('Certificate of Completion', 0, 80, { align: 'center' });

    // Subtitle
    doc
      .fillColor('#94a3b8')
      .fontSize(14)
      .font('Helvetica')
      .text('Veyro Online Distance Education Portal', 0, 130, { align: 'center' });

    // Divider
    doc
      .moveTo(100, 160)
      .lineTo(doc.page.width - 100, 160)
      .lineWidth(1)
      .stroke('#334155');

    // Body
    doc
      .fillColor('#e2e8f0')
      .fontSize(16)
      .font('Helvetica')
      .text('This is to certify that', 0, 185, { align: 'center' });

    doc
      .fillColor('#ffffff')
      .fontSize(32)
      .font('Helvetica-Bold')
      .text(studentName, 0, 215, { align: 'center' });

    doc
      .fillColor('#e2e8f0')
      .fontSize(16)
      .font('Helvetica')
      .text('has successfully completed the course', 0, 265, { align: 'center' });

    doc
      .fillColor('#f59e0b')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text(courseTitle, 0, 295, { align: 'center' });

    const dateStr = new Date(completedAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    doc
      .fillColor('#94a3b8')
      .fontSize(12)
      .font('Helvetica')
      .text(`Completed on: ${dateStr}`, 0, 345, { align: 'center' });

    // Verification code
    doc
      .fillColor('#475569')
      .fontSize(10)
      .text(`Verification Code: ${verificationCode}`, 0, doc.page.height - 60, {
        align: 'center',
      });

    doc.end();

    stream.on('finish', () => resolve(`certificates/${filename}`));
    stream.on('error', reject);
  });
};

module.exports = { generateCertificate };
