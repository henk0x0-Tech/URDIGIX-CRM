import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }[];
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendEmail(options: EmailOptions): Promise<void> {
  const from = process.env.SMTP_FROM || 'URDIGIX ERP <noreply@urdigix.com>';

  await transporter.sendMail({
    from,
    to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    attachments: options.attachments,
  });
}

export function buildInvoiceEmail(
  clientName: string,
  invoiceNumber: string,
  amount: string,
  dueDate: string
): { subject: string; html: string } {
  return {
    subject: `Invoice ${invoiceNumber} from URDIGIX Solutions`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1a2e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .amount { font-size: 24px; font-weight: bold; color: #1a1a2e; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          .btn { display: inline-block; background: #1a1a2e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>URDIGIX Solutions</h1>
          </div>
          <div class="content">
            <p>Dear ${clientName},</p>
            <p>Please find attached Invoice <strong>${invoiceNumber}</strong> for your review.</p>
            <p>Amount Due: <span class="amount">${amount}</span></p>
            <p>Due Date: <strong>${dueDate}</strong></p>
            <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
            <p>Thank you for your business!</p>
            <p>Best regards,<br>URDIGIX Solutions Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email from URDIGIX ERP System.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}
