import type { Adapter, AdapterUser, AdapterAccount } from "next-auth/adapters"
import { v4 as uuidv4 } from "uuid"
import { prisma } from "./db"
import { generateSalt, hashPassword } from "./auth-utils"

export function PrismaAdapter(): Adapter {
  return {
    async createUser(user: Omit<AdapterUser, "id">) {
      try {
        const userId = uuidv4()
        const salt = generateSalt()
        const hashedPassword = hashPassword("", salt) // Empty password for OAuth users

        const createdUser = await prisma.user.create({
          data: {
            id: userId,
            name: user.name || null,
            email: user.email,
            passwordHash: hashedPassword,
            passwordSalt: salt,
            emailVerified: user.emailVerified || null,
            image: user.image || null,
          },
        })

        return {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          emailVerified: createdUser.emailVerified,
          image: createdUser.image,
        }
      } catch (error) {
        console.error("Error creating user:", error)
        throw error
      }
    },

    async getUser(id) {
      try {
        const user = await prisma.user.findUnique({
          where: { id },
        })

        if (!user) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
        }
      } catch (error) {
        console.error("Error getting user:", error)
        return null
      }
    },

    async getUserByEmail(email) {
      try {
        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
        }
      } catch (error) {
        console.error("Error getting user by email:", error)
        return null
      }
    },

    async getUserByAccount({ providerAccountId, provider }) {
      try {
        const account = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider,
              providerAccountId,
            },
          },
          include: {
            user: true,
          },
        })

        if (!account) return null

        return {
          id: account.user.id,
          name: account.user.name,
          email: account.user.email,
          emailVerified: account.user.emailVerified,
          image: account.user.image,
        }
      } catch (error) {
        console.error("Error getting user by account:", error)
        return null
      }
    },

    async updateUser(user) {
      try {
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: user.name || null,
            email: user.email || null,
            emailVerified: user.emailVerified || null,
            image: user.image || null,
          },
        })

        return {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          emailVerified: updatedUser.emailVerified,
          image: updatedUser.image,
        }
      } catch (error) {
        console.error("Error updating user:", error)
        throw error
      }
    },

    async deleteUser(userId) {
      try {
        await prisma.user.delete({
          where: { id: userId },
        })
      } catch (error) {
        console.error("Error deleting user:", error)
        throw error
      }
    },

    async linkAccount(account: AdapterAccount) {
      try {
        await prisma.account.create({
          data: {
            userId: account.userId,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refreshToken: account.refresh_token || null,
            accessToken: account.access_token || null,
            expiresAt: account.expires_at ? BigInt(account.expires_at) : null,
            tokenType: account.token_type || null,
            scope: account.scope || null,
            idToken: account.id_token || null,
            sessionState: account.session_state || null,
          },
        })
      } catch (error) {
        console.error("Error linking account:", error)
        throw error
      }
    },

    async unlinkAccount({ providerAccountId, provider }) {
      try {
        await prisma.account.delete({
          where: {
            provider_providerAccountId: {
              provider,
              providerAccountId,
            },
          },
        })
      } catch (error) {
        console.error("Error unlinking account:", error)
        throw error
      }
    },

    async createSession({ sessionToken, userId, expires }) {
      try {
        const session = await prisma.session.create({
          data: {
            sessionToken,
            userId,
            expires,
          },
        })

        return {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        }
      } catch (error) {
        console.error("Error creating session:", error)
        throw error
      }
    },

    async getSessionAndUser(sessionToken) {
      try {
        const session = await prisma.session.findUnique({
          where: { sessionToken },
          include: { user: true },
        })

        if (!session) return null

        return {
          session: {
            sessionToken: session.sessionToken,
            userId: session.userId,
            expires: session.expires,
          },
          user: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            emailVerified: session.user.emailVerified,
            image: session.user.image,
          },
        }
      } catch (error) {
        console.error("Error getting session and user:", error)
        return null
      }
    },

    async updateSession({ sessionToken, userId, expires }) {
      try {
        const session = await prisma.session.update({
          where: { sessionToken },
          data: {
            userId: userId || undefined,
            expires: expires || undefined,
          },
        })

        return {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        }
      } catch (error) {
        console.error("Error updating session:", error)
        throw error
      }
    },

    async deleteSession(sessionToken) {
      try {
        await prisma.session.delete({
          where: { sessionToken },
        })
      } catch (error) {
        console.error("Error deleting session:", error)
        throw error
      }
    },

    async createVerificationToken({ identifier, expires, token }) {
      try {
        const verificationToken = await prisma.verificationToken.create({
          data: {
            identifier,
            token,
            expires,
          },
        })

        return {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
          expires: verificationToken.expires,
        }
      } catch (error) {
        console.error("Error creating verification token:", error)
        throw error
      }
    },

    async useVerificationToken({ identifier, token }) {
      try {
        const verificationToken = await prisma.verificationToken.delete({
          where: {
            identifier_token: {
              identifier,
              token,
            },
          },
        })

        return {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
          expires: verificationToken.expires,
        }
      } catch (error) {
        console.error("Error using verification token:", error)
        return null
      }
    },
  }
}
