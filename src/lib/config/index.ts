interface DatabaseConfig {
  url: string
  maxConnections: number
  connectionTimeout: number
}

interface AuthConfig {
  accessTokenSecret: string
  refreshTokenSecret: string
  accessTokenExpiry: string
  refreshTokenExpiry: string
  otpExpiry: number
  resendCooldown: number
}

interface EmailConfig {
  provider: 'resend' | 'sendgrid' | 'ses'
  apiKey: string
  fromAddress: string
  templates: {
    otpCode: string
    welcome: string
  }
}

interface StorageConfig {
  provider: 'local' | 's3' | 'gcs'
  uploadDir: string
  maxFileSize: number
  allowedTypes: string[]
  publicUrl?: string
}

interface AIConfig {
  defaultProvider: 'google' | 'openai' | 'anthropic'
  providers: {
    google: {
      apiKey: string
      model: string
      maxTokens: number
    }
    openai: {
      apiKey: string
      model: string
      maxTokens: number
    }
    anthropic: {
      apiKey: string
      model: string
      maxTokens: number
    }
  }
  systemPrompts: {
    tutor: string
    summarizer: string
    annotator: string
  }
}

interface ServerConfig {
  port: number
  cors: {
    origin: string[]
    methods: string[]
  }
  rateLimit: {
    windowMs: number
    maxRequests: number
  }
}

interface AppConfig {
  environment: 'development' | 'staging' | 'production'
  database: DatabaseConfig
  auth: AuthConfig
  email: EmailConfig
  storage: StorageConfig
  ai: AIConfig
  server: ServerConfig
}

function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Environment variable ${key} is required`)
  }
  return value
}

function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue
}

function getNumericEnv(key: string, defaultValue: number): number {
  const value = process.env[key]
  return value ? parseInt(value, 10) : defaultValue
}

function createDatabaseConfig(): DatabaseConfig {
  return {
    url: getRequiredEnv('DATABASE_URL'),
    maxConnections: getNumericEnv('DB_MAX_CONNECTIONS', 10),
    connectionTimeout: getNumericEnv('DB_CONNECTION_TIMEOUT', 30000),
  }
}

function createAuthConfig(): AuthConfig {
  return {
    accessTokenSecret: getRequiredEnv('SECRET_ACCESS_TOKEN'),
    refreshTokenSecret: getRequiredEnv('SECRET_REFRESH_TOKEN'),
    accessTokenExpiry: getOptionalEnv('ACCESS_TOKEN_EXPIRY', '7d'),
    refreshTokenExpiry: getOptionalEnv('REFRESH_TOKEN_EXPIRY', '7d'),
    otpExpiry: getNumericEnv('OTP_EXPIRY_MINUTES', 10),
    resendCooldown: getNumericEnv('OTP_RESEND_COOLDOWN', 60),
  }
}

function createEmailConfig(): EmailConfig {
  return {
    provider: getOptionalEnv('EMAIL_PROVIDER', 'resend') as 'resend',
    apiKey: getRequiredEnv('RESEND_API_KEY'),
    fromAddress: getOptionalEnv('FROM_EMAIL', 'AI Tutor <noreply@spidermines.com>'),
    templates: {
      otpCode: 'otp-code',
      welcome: 'welcome',
    },
  }
}

function createStorageConfig(): StorageConfig {
  return {
    provider: getOptionalEnv('STORAGE_PROVIDER', 'local') as 'local',
    uploadDir: getOptionalEnv('UPLOAD_DIR', 'uploads'),
    maxFileSize: getNumericEnv('MAX_FILE_SIZE', 10 * 1024 * 1024), // 10MB
    allowedTypes: ['application/pdf'],
    publicUrl: getOptionalEnv('PUBLIC_URL', '/api/uploads'),
  }
}

function createAIConfig(): AIConfig {
  return {
    defaultProvider: getOptionalEnv('AI_DEFAULT_PROVIDER', 'google') as 'google',
    providers: {
      google: {
        apiKey: getOptionalEnv('GOOGLE_GENERATIVE_AI_API_KEY', ''),
        model: getOptionalEnv('GOOGLE_AI_MODEL', 'gemini-2.5-flash'),
        maxTokens: getNumericEnv('GOOGLE_MAX_TOKENS', 4000),
      },
      openai: {
        apiKey: getOptionalEnv('OPENAI_API_KEY', ''),
        model: getOptionalEnv('OPENAI_MODEL', 'gpt-4'),
        maxTokens: getNumericEnv('OPENAI_MAX_TOKENS', 4000),
      },
      anthropic: {
        apiKey: getOptionalEnv('ANTHROPIC_API_KEY', ''),
        model: getOptionalEnv('ANTHROPIC_MODEL', 'claude-3-sonnet-20240229'),
        maxTokens: getNumericEnv('ANTHROPIC_MAX_TOKENS', 4000),
      },
    },
    systemPrompts: {
      tutor: `You are an AI tutor helping students understand documents. 
              Be clear, encouraging, and reference specific sections when possible.`,
      summarizer: `Provide concise summaries of document sections while maintaining key information.`,
      annotator: `Suggest important sections to highlight and annotate for better learning.`,
    },
  }
}

function createServerConfig(): ServerConfig {
  return {
    port: getNumericEnv('PORT', 3000),
    cors: {
      origin: getOptionalEnv('CORS_ORIGIN', '*').split(','),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    },
    rateLimit: {
      windowMs: getNumericEnv('RATE_LIMIT_WINDOW', 15 * 60 * 1000), // 15 minutes
      maxRequests: getNumericEnv('RATE_LIMIT_MAX', 100),
    },
  }
}

function createAppConfig(): AppConfig {
  return {
    environment: getOptionalEnv('NODE_ENV', 'development') as 'development',
    database: createDatabaseConfig(),
    auth: createAuthConfig(),
    email: createEmailConfig(),
    storage: createStorageConfig(),
    ai: createAIConfig(),
    server: createServerConfig(),
  }
}

export const config = createAppConfig()

export default config
