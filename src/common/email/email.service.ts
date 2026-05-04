import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@equip-platform.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.log(
        `Email sent successfully to ${options.to}: ${info.messageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  generateOtpEmailTemplate(
    email: string,
    otp: string,
    expiryMinutes: number = 5,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>OTP Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
            .otp-box { background-color: #fff; border: 2px solid #007bff; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; }
            .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
            .warning { color: #dc3545; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Your One-Time Password (OTP) for the Equip Exam Platform is:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              <p>This OTP will expire in <strong>${expiryMinutes} minutes</strong>.</p>
              <p class="warning">⚠️ If you did not request this OTP, please ignore this email.</p>
              <p>Please do not share this OTP with anyone.</p>
              <hr>
              <div class="footer">
                <p>© 2026 Equip Exam Platform. All rights reserved.</p>
                <p><em>This is an automated email. Please do not reply to this message.</em></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  generateWelcomeEmailTemplate(
    email: string,
    candidateName: string = 'Candidate',
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Welcome to Equip Exam Platform</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Equip!</h1>
            </div>
            <div class="content">
              <p>Hello ${candidateName},</p>
              <p>Your account has been successfully created. You are now registered on the Equip Exam Platform.</p>
              <p>You can now log in and access the exam portal. Good luck!</p>
              <hr>
              <p><strong>Account Details:</strong></p>
              <p>Email: ${email}</p>
              <hr>
              <div class="footer">
                <p>© 2026 Equip Exam Platform. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }
  generateAssessmentInviteEmail(
    email: string,
    inviteLink: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Assessment Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          
          <div class="header">
            <h1>You're Invited!</h1>
          </div>

          <div class="content">
            <p>Hello,</p>

            <p>You have been invited to take an assessment on the <strong>Equip Exam Platform</strong>.</p>

            <p>Please click the button below to start your assessment:</p>

            <a href="${inviteLink}" class="button">Start Assessment</a>

            <p><strong>Note:</strong> Make sure to complete the assessment before the deadline.</p>

            <p>If you face any issues accessing the assessment, please contact the recruiter.</p>

            <p>Good luck!</p>

            <hr>

            <div class="footer">
              <p>© 2026 Equip Exam Platform. All rights reserved.</p>
            </div>

          </div>
        </div>
      </body>
    </html>
  `;
}
}
