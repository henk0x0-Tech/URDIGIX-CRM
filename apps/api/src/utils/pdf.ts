import PDFDocument from 'pdfkit';
import { Decimal } from '@prisma/client/runtime/library';

interface InvoiceData {
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  status: string;
  subtotal: Decimal;
  taxRate: Decimal;
  taxAmount: Decimal;
  discountRate: Decimal;
  discountAmount: Decimal;
  totalAmount: Decimal;
  paidAmount: Decimal;
  currency: string;
  notes: string | null;
  termsConditions: string | null;
  client: {
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string;
    postalCode: string | null;
    gstNumber: string | null;
  };
  items: {
    description: string;
    quantity: Decimal;
    unitPrice: Decimal;
    taxRate: Decimal;
    taxAmount: Decimal;
    totalPrice: Decimal;
    sortOrder: number;
  }[];
}

function formatCurrencyValue(amount: Decimal | number, currency: string = 'INR'): string {
  const num = typeof amount === 'number' ? amount : Number(amount);
  const symbol = currency === 'INR' ? '₹' : '$';
  return `${symbol}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateValue(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function generateInvoicePDF(invoice: InvoiceData): PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // ---- Company Header ----
  doc.fontSize(24).font('Helvetica-Bold').text('URDIGIX', 50, 50);
  doc.fontSize(10).font('Helvetica').text('Solutions Private Limited', 50, 78);
  doc.fontSize(9).fillColor('#666666');
  doc.text('123 Tech Park, Whitefield', 50, 95);
  doc.text('Bangalore, Karnataka 560066, India', 50, 108);
  doc.text('GSTIN: 29AABCU1234F1ZM', 50, 121);
  doc.text('Email: billing@urdigix.com | Phone: +91 80 4567 8900', 50, 134);

  // Invoice Title
  doc.fontSize(28).fillColor('#1a1a2e').font('Helvetica-Bold').text('INVOICE', 400, 50, { align: 'right' });

  // Invoice Details Box
  doc.fontSize(10).font('Helvetica').fillColor('#333333');
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 350, 90, { align: 'right' });
  doc.text(`Issue Date: ${formatDateValue(invoice.issueDate)}`, 350, 105, { align: 'right' });
  doc.text(`Due Date: ${formatDateValue(invoice.dueDate)}`, 350, 120, { align: 'right' });
  doc.text(`Status: ${invoice.status}`, 350, 135, { align: 'right' });

  // Horizontal line
  doc.moveTo(50, 155).lineTo(545, 155).strokeColor('#dddddd').lineWidth(1).stroke();

  // ---- Bill To ----
  let y = 170;
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a1a2e').text('Bill To:', 50, y);
  y += 18;
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333').text(invoice.client.companyName, 50, y);
  y += 15;
  doc.font('Helvetica').text(invoice.client.contactPerson, 50, y);
  y += 13;
  if (invoice.client.address) {
    doc.text(invoice.client.address, 50, y);
    y += 13;
  }
  const cityState = [invoice.client.city, invoice.client.state, invoice.client.postalCode]
    .filter(Boolean)
    .join(', ');
  if (cityState) {
    doc.text(cityState, 50, y);
    y += 13;
  }
  doc.text(invoice.client.country, 50, y);
  y += 13;
  doc.text(invoice.client.email, 50, y);
  y += 13;
  if (invoice.client.phone) {
    doc.text(`Phone: ${invoice.client.phone}`, 50, y);
    y += 13;
  }
  if (invoice.client.gstNumber) {
    doc.text(`GSTIN: ${invoice.client.gstNumber}`, 50, y);
    y += 13;
  }

  // ---- Items Table ----
  y = Math.max(y + 20, 310);

  // Table Header
  const tableTop = y;
  doc.rect(50, tableTop, 495, 25).fill('#1a1a2e');
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
  doc.text('#', 58, tableTop + 7, { width: 25 });
  doc.text('Description', 85, tableTop + 7, { width: 200 });
  doc.text('Qty', 290, tableTop + 7, { width: 50, align: 'right' });
  doc.text('Unit Price', 345, tableTop + 7, { width: 70, align: 'right' });
  doc.text('Tax', 420, tableTop + 7, { width: 40, align: 'right' });
  doc.text('Total', 465, tableTop + 7, { width: 75, align: 'right' });

  // Table Rows
  y = tableTop + 25;
  const sortedItems = [...invoice.items].sort((a, b) => a.sortOrder - b.sortOrder);

  sortedItems.forEach((item, index) => {
    const rowColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff';
    doc.rect(50, y, 495, 22).fill(rowColor);

    doc.fontSize(9).font('Helvetica').fillColor('#333333');
    doc.text(`${index + 1}`, 58, y + 6, { width: 25 });
    doc.text(item.description, 85, y + 6, { width: 200 });
    doc.text(Number(item.quantity).toString(), 290, y + 6, { width: 50, align: 'right' });
    doc.text(formatCurrencyValue(item.unitPrice, invoice.currency), 345, y + 6, {
      width: 70,
      align: 'right',
    });
    doc.text(`${Number(item.taxRate)}%`, 420, y + 6, { width: 40, align: 'right' });
    doc.text(formatCurrencyValue(item.totalPrice, invoice.currency), 465, y + 6, {
      width: 75,
      align: 'right',
    });
    y += 22;
  });

  // Table bottom line
  doc.moveTo(50, y).lineTo(545, y).strokeColor('#dddddd').lineWidth(1).stroke();

  // ---- Totals ----
  y += 15;
  const totalsX = 380;
  const totalsValueX = 465;
  const totalsWidth = 75;

  doc.fontSize(10).font('Helvetica').fillColor('#333333');
  doc.text('Subtotal:', totalsX, y, { width: 80 });
  doc.text(formatCurrencyValue(invoice.subtotal, invoice.currency), totalsValueX, y, {
    width: totalsWidth,
    align: 'right',
  });
  y += 18;

  if (Number(invoice.taxRate) > 0) {
    doc.text(`Tax (${Number(invoice.taxRate)}%):`, totalsX, y, { width: 80 });
    doc.text(formatCurrencyValue(invoice.taxAmount, invoice.currency), totalsValueX, y, {
      width: totalsWidth,
      align: 'right',
    });
    y += 18;
  }

  if (Number(invoice.discountRate) > 0) {
    doc.text(`Discount (${Number(invoice.discountRate)}%):`, totalsX, y, { width: 80 });
    doc.text(`-${formatCurrencyValue(invoice.discountAmount, invoice.currency)}`, totalsValueX, y, {
      width: totalsWidth,
      align: 'right',
    });
    y += 18;
  }

  // Total line
  doc.moveTo(totalsX, y).lineTo(545, y).strokeColor('#1a1a2e').lineWidth(1).stroke();
  y += 8;

  doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a1a2e');
  doc.text('Total:', totalsX, y, { width: 80 });
  doc.text(formatCurrencyValue(invoice.totalAmount, invoice.currency), totalsValueX, y, {
    width: totalsWidth,
    align: 'right',
  });
  y += 20;

  if (Number(invoice.paidAmount) > 0) {
    doc.fontSize(10).font('Helvetica').fillColor('#22c55e');
    doc.text('Paid:', totalsX, y, { width: 80 });
    doc.text(formatCurrencyValue(invoice.paidAmount, invoice.currency), totalsValueX, y, {
      width: totalsWidth,
      align: 'right',
    });
    y += 18;

    const balance = Number(invoice.totalAmount) - Number(invoice.paidAmount);
    doc.font('Helvetica-Bold').fillColor(balance > 0 ? '#ef4444' : '#22c55e');
    doc.text('Balance Due:', totalsX, y, { width: 80 });
    doc.text(formatCurrencyValue(balance, invoice.currency), totalsValueX, y, {
      width: totalsWidth,
      align: 'right',
    });
    y += 20;
  }

  // ---- Notes ----
  if (invoice.notes) {
    y = Math.max(y + 10, y);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a1a2e').text('Notes:', 50, y);
    y += 15;
    doc.fontSize(9).font('Helvetica').fillColor('#666666').text(invoice.notes, 50, y, { width: 300 });
    y += doc.heightOfString(invoice.notes, { width: 300 }) + 10;
  }

  // ---- Terms & Conditions ----
  if (invoice.termsConditions) {
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a1a2e').text('Terms & Conditions:', 50, y);
    y += 15;
    doc.fontSize(8).font('Helvetica').fillColor('#666666').text(invoice.termsConditions, 50, y, {
      width: 495,
    });
  }

  // ---- Footer ----
  doc.fontSize(8).fillColor('#999999').font('Helvetica');
  doc.text('Thank you for your business!', 50, 750, { align: 'center', width: 495 });
  doc.text('This is a computer-generated invoice and does not require a signature.', 50, 762, {
    align: 'center',
    width: 495,
  });

  doc.end();
  return doc;
}
