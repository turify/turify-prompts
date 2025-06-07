import crypto from "crypto"

export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex")
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const hashedPassword = hashPassword(password, salt)
  return hashedPassword === hash
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isStrongPassword(password: string): { isValid: boolean; message: string } {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" }
  }

  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }
  }

  return { isValid: true, message: "" }
}
