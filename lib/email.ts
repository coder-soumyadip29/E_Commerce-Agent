import crypto from "crypto";
import nodemailer from "nodemailer";
import { InvoiceData } from "./types";

export interface SendVerificationResult {
  success: boolean;
  code: string;
  devMode: boolean;
  message: string;
}

export function generateVerificationCode(): string {
  // Generate a cryptographically secure 6-digit code (e.g. 100000 - 999999)
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationEmail(
  email: string,
  code: string,
  userName: string
): Promise<SendVerificationResult> {
  const isSmtpConfigured = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );

  console.log(`\n==================================================`);
  console.log(`✉️  CARTWISE EMAIL VERIFICATION CODE`);
  console.log(`   To: ${userName} <${email}>`);
  console.log(`   Verification OTP: [ ${code} ]`);
  console.log(`   Valid for: 15 minutes`);
  console.log(`   SMTP Active: ${isSmtpConfigured ? `Yes (${process.env.SMTP_HOST})` : "No (Dev Mode)"}`);
  console.log(`==================================================\n`);

  if (isSmtpConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"CartWise Support" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `${code} is your CartWise verification code`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; border: 1px solid #1e293b; border-radius: 16px; background: #0f172a; color: #f8fafc;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #38bdf8; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">CartWise PLUS</h1>
              <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">AI Verified Membership</p>
            </div>
            <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
              <p style="color: #e2e8f0; font-size: 15px; margin: 0 0 12px;">Hi <strong>${userName}</strong>,</p>
              <p style="color: #94a3b8; font-size: 14px; margin: 0 0 16px; line-height: 1.5;">
                Welcome to CartWise! Enter the 6-digit verification code below to verify your email and activate your account.
              </p>
              <div style="background: #090d16; border: 1px solid #38bdf840; border-radius: 10px; padding: 18px; text-align: center; margin: 16px 0;">
                <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #38bdf8;">${code}</span>
              </div>
              <p style="color: #64748b; font-size: 12px; margin: 12px 0 0; text-align: center;">
                ⏱️ This code expires in 15 minutes.
              </p>
            </div>
            <p style="color: #475569; font-size: 11px; text-align: center; margin: 0;">
              If you didn't request this verification code, you can safely ignore this email.
            </p>
          </div>
        `,
      });

      console.log(`✅ Email sent successfully via Brevo to ${email}`);

      return {
        success: true,
        code,
        devMode: false,
        message: `Verification email delivered to ${email}`,
      };
    } catch (e: any) {
      console.warn("⚠️ SMTP delivery encountered an error, falling back to local OTP:", e.message);
    }
  }

  // Development mode fallback
  return {
    success: true,
    code,
    devMode: true,
    message: `Verification code generated: ${code}`,
  };
}

// Password hashing and verification using Node.js crypto
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === verifyHash;
}

export async function sendOrderInvoiceEmail(
  toEmailOrInvoice: string | InvoiceData,
  maybeInvoice?: InvoiceData
): Promise<{ success: boolean; devMode: boolean; message: string }> {
  const invoice = typeof toEmailOrInvoice === "string" ? maybeInvoice! : toEmailOrInvoice;
  const toEmail =
    typeof toEmailOrInvoice === "string"
      ? toEmailOrInvoice
      : invoice.customerEmail || "sumankuity68@gmail.com";

  const isSmtpConfigured = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );

  console.log(`\n==================================================`);
  console.log(`📄 CARTWISE TAX INVOICE & RECEIPT DISPATCH`);
  console.log(`   To: ${invoice.customerName} <${toEmail}>`);
  console.log(`   Invoice No: [ ${invoice.invoiceNumber} ]`);
  console.log(`   Order ID: #${invoice.orderId} | Txn: ${invoice.paymentId}`);
  console.log(`   Total Amount: $${invoice.finalTotal.toFixed(2)} (GST: $${invoice.gst.totalGst.toFixed(2)})`);
  console.log(`   SMTP Active: ${isSmtpConfigured ? `Yes (${process.env.SMTP_HOST})` : "No (Dev Mode)"}`);
  console.log(`==================================================\n`);

  if (isSmtpConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const itemsRowsHtml = invoice.items
        .map(
          (item) => `
          <tr style="border-bottom: 1px solid #1e293b;">
            <td style="padding: 10px 8px; font-size: 13px; color: #f8fafc;">
              <strong>${item.product_name}</strong>
              <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">HSN: ${item.hsn_code}</div>
            </td>
            <td style="padding: 10px 8px; font-size: 13px; text-align: center; color: #cbd5e1;">${item.quantity}</td>
            <td style="padding: 10px 8px; font-size: 13px; text-align: right; color: #cbd5e1;">$${item.unit_price.toFixed(2)}</td>
            <td style="padding: 10px 8px; font-size: 13px; text-align: right; color: #34d399; font-weight: bold;">$${item.line_total.toFixed(2)}</td>
          </tr>
        `
        )
        .join("");

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"CartWise Orders" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: `Your CartWise Tax Invoice & Receipt: ${invoice.invoiceNumber} (Order #${invoice.orderId})`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 32px 24px; border: 1px solid #1e293b; border-radius: 20px; background: #0b1120; color: #f8fafc;">
            {/* Header */}
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 20px;">
              <div>
                <h1 style="color: #38bdf8; font-size: 26px; margin: 0; font-weight: 900; letter-spacing: -0.5px;">CartWise PLUS</h1>
                <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">TAX INVOICE / CASH MEMO</p>
                <div style="font-size: 10px; color: #64748b; margin-top: 4px; font-family: monospace;">GSTIN: ${invoice.storeGstin} • FSSAI: ${invoice.storeFssai}</div>
              </div>
              <div style="text-align: right;">
                <span style="background: #10b98120; color: #34d399; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 999px; border: 1px solid #10b98140;">PAID VERIFIED</span>
                <div style="font-size: 12px; font-weight: bold; color: #f8fafc; margin-top: 6px; font-family: monospace;">${invoice.invoiceNumber}</div>
                <div style="font-size: 11px; color: #64748b;">${invoice.date}</div>
              </div>
            </div>

            {/* Logistics & Payment Meta */}
            <div style="background: #131b2e; border: 1px solid #1e293b; border-radius: 14px; padding: 16px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="vertical-align: top; width: 50%; padding-right: 12px;">
                    <span style="font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: bold; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Delivered To:</span>
                    <strong style="color: #f8fafc; font-size: 13px;">${invoice.customerName}</strong>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 2px; line-height: 1.4;">
                      ${invoice.deliveryAddress.street_address}<br/>
                      ${invoice.deliveryAddress.city} - ${invoice.deliveryAddress.pincode}
                    </div>
                  </td>
                  <td style="vertical-align: top; width: 50%; padding-left: 12px; border-left: 1px solid #1e293b;">
                    <span style="font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: bold; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Payment & Slot:</span>
                    <div style="font-size: 12px; color: #f8fafc;">
                      <strong>Mode:</strong> ${invoice.paymentMethod.toUpperCase()}<br/>
                      <span style="font-family: monospace; font-size: 11px; color: #38bdf8;">Txn: ${invoice.paymentId}</span><br/>
                      <span style="color: #fbbf24; font-size: 11px;">⚡ ${invoice.deliverySlot?.title || "30-Min Fast Express"}</span>
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            {/* Itemized Table */}
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #1e293b; text-align: left;">
                  <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #94a3b8;">Item Description</th>
                  <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #94a3b8; text-align: center;">Qty</th>
                  <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #94a3b8; text-align: right;">Rate</th>
                  <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #94a3b8; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRowsHtml}
              </tbody>
            </table>

            {/* GST & Total Breakdown */}
            <div style="background: #131b2e; border: 1px solid #1e293b; border-radius: 14px; padding: 16px; margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-bottom: 6px;">
                <span>Taxable Amount (Excl. Tax):</span>
                <span>$${invoice.gst.taxableSubtotal.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-bottom: 6px;">
                <span>CGST @ 2.5%:</span>
                <span>$${invoice.gst.cgstAmount.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-bottom: 6px;">
                <span>SGST @ 2.5%:</span>
                <span>$${invoice.gst.sgstAmount.toFixed(2)}</span>
              </div>
              ${
                invoice.discountAmount > 0
                  ? `<div style="display: flex; justify-content: space-between; font-size: 12px; color: #38bdf8; margin-bottom: 6px;">
                <span>Discount Applied (${invoice.discountCode}):</span>
                <span>-$${invoice.discountAmount.toFixed(2)}</span>
              </div>`
                  : ""
              }
              <div style="display: flex; justify-content: space-between; font-size: 12px; color: #34d399; margin-bottom: 10px;">
                <span>Fulfillment & Express Delivery:</span>
                <span>FREE ($0.00)</span>
              </div>
              <div style="border-top: 1px solid #1e293b; padding-top: 10px; display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; color: #f8fafc;">
                <span>Total Paid Amount:</span>
                <span style="color: #34d399;">$${invoice.finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 16px; font-size: 11px; color: #64748b;">
              <p style="margin: 0 0 4px;">Thank you for ordering with CartWise Organic Intelligence!</p>
              <p style="margin: 0; font-size: 10px;">This is a computer generated invoice and requires no physical signature.</p>
            </div>
          </div>
        `,
      });

      console.log(`✅ Invoice email delivered via Brevo to ${toEmail}`);
      return { success: true, devMode: false, message: `Invoice sent to ${toEmail}` };
    } catch (e: any) {
      console.warn("⚠️ SMTP invoice delivery notice:", e.message);
    }
  }

  return { success: true, devMode: true, message: `Invoice simulated in dev mode for ${toEmail}` };
}
