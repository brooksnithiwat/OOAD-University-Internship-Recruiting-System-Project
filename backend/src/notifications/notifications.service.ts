import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter!: nodemailer.Transporter;
  
  constructor() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpPortNumber = parseInt(smtpPort || '465', 10);
    const smtpSecure = (process.env.SMTP_SECURE || '').toLowerCase() === 'true' || smtpPortNumber === 465;

    // Only initialize transporter if SMTP is configured
    if (smtpHost && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPortNumber,
        secure: smtpSecure,
        family: 4,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      } as any);
    }
  }

  async sendNewApplicationEmail(
    employerEmail: string,
    jobTitle: string,
    studentName: string,
  ): Promise<void> {
    const subject = `New Application Received: ${jobTitle}`;
    const htmlContent = `
      <h2>New Application Received</h2>
      <p>Dear Employer,</p>
      <p>A new application has been submitted for the position: <strong>${jobTitle}</strong></p>
      <p>Student Name: <strong>${studentName}</strong></p>
      <p>Please log in to the system to review the application details.</p>
      <p>Best regards,<br/>University Internship Recruiting System</p>
    `;

    await this.sendEmail(employerEmail, subject, htmlContent);
  }

  async sendStatusUpdateEmail(
    studentEmail: string,
    jobTitle: string,
    newStatus: string,
  ): Promise<void> {
    const subject = `Application Status Update: ${jobTitle}`;
    const statusDisplay = this.formatStatus(newStatus);
    const htmlContent = `
      <h2>Application Status Update</h2>
      <p>Dear Student,</p>
      <p>Your application for the position <strong>${jobTitle}</strong> has been updated.</p>
      <p>New Status: <strong>${statusDisplay}</strong></p>
      <p>Please log in to the system to view more details.</p>
      <p>Best regards,<br/>University Internship Recruiting System</p>
    `;

    await this.sendEmail(studentEmail, subject, htmlContent);
  }

  private async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
  ): Promise<void> {
    try {
      // If transporter is not configured, log to console as fallback
      if (!this.transporter) {
        this.logger.warn(
          `[EMAIL FALLBACK] To: ${to}, Subject: ${subject}, Content: ${htmlContent}`,
        );
        return;
      }

      const fromEmail = process.env.SMTP_FROM || 'noreply@university-internship.com';

      await this.transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        html: htmlContent,
      });

      this.logger.log(`Email sent successfully to: ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      // Don't throw error - graceful fallback
    }
  }

  private formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      PENDING: 'Pending Review',
      INTERVIEW_REQUEST: 'Interview Requested',
      OFFER_SENT: 'Offer Sent',
      ACCEPTED: 'Accepted',
      REJECTED: 'Rejected',
      WITHDRAWN: 'Withdrawn',
    };
    return statusMap[status] || status;
  }
}
