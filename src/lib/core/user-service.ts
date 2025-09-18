import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface User {
  id: string
  email: string
  emailConfirmedAt: Date | null
  createdAt?: Date
}

function createUserData(email: string) {
  return {
    email,
    emailConfirmedAt: null,
  }
}

async function findUserByEmail(email: string): Promise<User | null> {
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

async function createUser(email: string): Promise<User | null> {
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

async function getUserIdFromEmail(email: string): Promise<string | null> {
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

async function confirmUserEmail(userId: string): Promise<boolean> {
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

async function getUserById(userId: string): Promise<User | null> {
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

async function initializeUser(userId: string): Promise<boolean> {
  return await confirmUserEmail(userId)
}

const UserService = {
  findByEmail: findUserByEmail,
  create: createUser,
  getIdFromEmail: getUserIdFromEmail,
  confirmEmail: confirmUserEmail,
  getById: getUserById,
  init: initializeUser,
}

export default UserService
