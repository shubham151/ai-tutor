// lib/services/user.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Pure functions
const createUserData = (email: string) => ({
  email,
  emailConfirmedAt: null,
})

// Database operations
const findUserByEmail = async (email: string) => {
  try {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailConfirmedAt: true,
      },
    })
  } catch (error) {
    console.error('Failed to find user:', error)
    return null
  }
}

const createUser = async (email: string) => {
  try {
    return await prisma.user.create({
      data: createUserData(email),
      select: {
        id: true,
        email: true,
        emailConfirmedAt: true,
      },
    })
  } catch (error) {
    console.error('Failed to create user:', error)
    return null
  }
}

const getUserIdFromEmail = async (email: string): Promise<string | null> => {
  try {
    let user = await findUserByEmail(email)

    if (!user) {
      user = await createUser(email)
    }

    return user?.id || null
  } catch (error) {
    console.error('Failed to get user ID:', error)
    return null
  }
}

const confirmUserEmail = async (userId: string): Promise<boolean> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { emailConfirmedAt: new Date() },
    })
    return true
  } catch (error) {
    console.error('Failed to confirm email:', error)
    return false
  }
}

const getUserById = async (userId: string) => {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailConfirmedAt: true,
        createdAt: true,
      },
    })
  } catch (error) {
    console.error('Failed to get user by ID:', error)
    return null
  }
}

const initializeUser = async (userId: string): Promise<boolean> => {
  return await confirmUserEmail(userId)
}

// Public API
export const User = {
  findByEmail: findUserByEmail,
  create: createUser,
  getIdFromEmail: getUserIdFromEmail,
  confirmEmail: confirmUserEmail,
  getById: getUserById,
  init: initializeUser,
} as const
