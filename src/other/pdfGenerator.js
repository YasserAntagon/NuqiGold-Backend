const fs = require('fs');
const PDFDocument = require('pdfkit');

const generateInvoicePDF = async (invoiceData, res) => {
  console.log(invoiceData)
  const doc = new PDFDocument();
  const filePath = `./pdf/TaxInvoice_${invoiceData.id}.pdf`;

  doc.pipe(fs.createWriteStream(filePath));

  let tableTop = 100;
  const left = 50;
  const center = 200;
  const right = 400;
  const description = 50;
  const grams = 200;
  const RPG = 310;
  const Total = 450;

  tableTop += 20;
  doc.image('assets/NUQI_gold_logo.png', left, 50, {
    fit: [70, 90],
    align: 'left',
    valign: 'top'
  });
  doc.fontSize(10).text('Original - Customer Copy ', right, tableTop);
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#000000').text('TAX INVOICE', left, tableTop);
  doc.moveDown();
  tableTop += 20;
  doc.fillColor('#4b2da6').font('Helvetica-Bold').text('Nuqi Gold', left, tableTop);
  doc.moveDown();
  tableTop += 60;
  doc.fillColor('#000000').fontSize(9).font('Helvetica').text('Office 501, 05th Floor, Innovation One, DIFC,', left, tableTop)
    .text('Dubai, UAE').fontSize(9).text('PAN No: AAGCJ2412E', right, tableTop)
    .fontSize(9).text('GSTIN: 29AAGCJ2412E1ZV')
    .fontSize(8).text('CIN No: U47733KA2023PTC181719');
  tableTop += 80;
  doc.moveDown();
  doc.fillColor('#305598').fontSize(11).font('Helvetica-Bold').text(`Order No`, left, tableTop)
  doc.fillColor('black').font('Helvetica').text(`(${invoiceData.id})`);
  doc.fillColor('#305598').fontSize(11).font('Helvetica-Bold').text(`Date`, center, tableTop);
  doc.fillColor('black').font('Helvetica').text(`${new Date(invoiceData.createdAt).toLocaleDateString()}`);
  doc.fillColor('#305598').fontSize(11).font('Helvetica-Bold').text(`Customer ID`, right, tableTop);
  doc.fillColor('black').font('Helvetica').text(`(${invoiceData.user_id})`);
  tableTop += 40;
  doc.fillColor('#305598').fontSize(11).font('Helvetica-Bold').text(`Bill To`, left, tableTop);
  doc.fillColor('black').fontSize(10).font('Helvetica').text(`Name: ${invoiceData.user.first_name} ${invoiceData.user.last_name}`);
  doc.font('Helvetica').text(`Phone Number: ${invoiceData.user.phone_prefix} ${invoiceData.user.phone_number}`);
  tableTop += 40;
  doc.strokeColor('#8aa0cf').moveTo(left, tableTop).lineTo(550, tableTop).stroke();
  tableTop += 15;
  doc.fillColor('#305598').fontSize(11).font('Helvetica-Bold').text("Description", description, tableTop);
  doc.fillColor('black').fontSize(10).font('Helvetica').text("Gold 24 Carat");
  doc.text("HSN Code: 71081300");
  doc.fillColor('#305598').fontSize(11).font('Helvetica-Bold').text(`Grams`, grams, tableTop);
  doc.fillColor('black').fontSize(10).font('Helvetica').text(`${invoiceData.gold_weight}`);
  doc.fillColor('#305598').fontSize(11).font('Helvetica-Bold').text(`Rate Per Gram`, RPG, tableTop);
  doc.fillColor('black').fontSize(10).font('Helvetica').text(`${invoiceData.buy_price}`);
  doc.fillColor('#305598').fontSize(11).font('Helvetica-Bold').text(`Total`, Total, tableTop);
  doc.fillColor('black').fontSize(10).font('Helvetica').text(`${invoiceData.amount}`)
  tableTop += 40;
  doc.moveTo(grams, tableTop).lineTo(550, tableTop).stroke();
  tableTop += 10;
  doc.fillColor('black').font('Helvetica-Bold').text('Applied Tax', grams, tableTop);
  tableTop += 15;
  doc.font('Helvetica').text(`(5% VAT)`)
  doc.text(`${invoiceData.vat}`, Total, tableTop);
  tableTop += 25;
  doc.strokeColor('#8aa0cf').moveTo(grams, tableTop).lineTo(550, tableTop).stroke();
  tableTop += 15;
  doc.font('Helvetica-Bold').fillColor('#305598').text('Total Invoice Value', grams, tableTop);
  doc.fillColor('black').text(`${invoiceData.amount}`, Total, tableTop)
  tableTop += 40;
  doc.moveDown();
  doc.fontSize(11).font('Helvetica-Bold').text('Declaration:', left, tableTop);
  doc.fontSize(11).font('Helvetica').text('We declare that the above quantity of goods are kept by the seller in a safe vault on behalf of the buyer. It can be delivered in minted product as per the Terms & Conditions', { align: 'left' });
  tableTop += 40;
  doc.moveDown();
  doc.fontSize(11).font('Helvetica-Bold').text('Disclaimer:', left, tableTop);
  doc.fontSize(11).font('Helvetica').text('The gold grams you own are calculated by dividing the amount paid net of GST by the gold rate and rounded down to 4 decimal places. For example, .00054 grams will be rounded down to .0005 grams.', { align: 'left' });
  tableTop += 100;
  doc.text(`(E & O.E.)`, left, tableTop);
  doc.text(`(Subject to Realization)`);
  tableTop += 40;
  doc.font('Helvetica').fillColor('black').text('For Nuqi Gold (Authorized Signatory)', RPG, tableTop);
  doc.end();

  doc.on('end', () => {
    res.download(filePath, () => {
      fs.unlinkSync(filePath); // Remove the file after sending it to the user
    });
  });
};

module.exports = generateInvoicePDF;