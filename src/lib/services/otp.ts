// lib/services/otp.ts
import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'
import { addMinutes } from 'date-fns'

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

// Pure functions for OTP operations
const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const isOtpExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt
}

const getOtpExpiryTime = (): Date => {
  return addMinutes(new Date(), 10) // 10 minutes expiry
}

// Database operations
const saveOtp = async (userId: string, code: string): Promise<boolean> => {
  try {
    // Clean up expired OTPs for this user
    await prisma.otpCode.deleteMany({
      where: {
        userId,
        expiresAt: { lt: new Date() },
      },
    })

    // Create new OTP
    await prisma.otpCode.create({
      data: {
        userId,
        code,
        expiresAt: getOtpExpiryTime(),
      },
    })

    return true
  } catch (error) {
    console.error('Failed to save OTP:', error)
    return false
  }
}

const verifyOtp = async (userId: string, code: string): Promise<boolean> => {
  try {
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        userId,
        code,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!otpRecord) {
      return false
    }

    if (isOtpExpired(otpRecord.expiresAt)) {
      // Clean up expired OTP
      await prisma.otpCode.delete({
        where: { id: otpRecord.id },
      })
      return false
    }

    // Clean up used OTP
    await prisma.otpCode.delete({
      where: { id: otpRecord.id },
    })

    return true
  } catch (error) {
    console.error('Failed to verify OTP:', error)
    return false
  }
}

// Email service
const sendOtpEmail = async (email: string, code: string): Promise<boolean> => {
  try {
    const { error } = await resend.emails.send({
      from: 'AI Tutor <noreply@spidermines.com>',
      to: [email],
      subject: 'Your AI Tutor Login Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your Login Code</h2>
          <p style="font-size: 16px; color: #666;">
            Use the following code to complete your login to AI Tutor:
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">
              ${code}
            </span>
          </div>
          <p style="font-size: 14px; color: #888;">
            This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Failed to send email:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Email service error:', error)
    return false
  }
}

// Public API
export const Otp = {
  generate: generateOtp,
  save: saveOtp,
  verify: verifyOtp,
  send: sendOtpEmail,
} as const
