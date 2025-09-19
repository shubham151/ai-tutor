// lib/ai/base-service.ts
import config from '@/lib/config'

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model?: string
}

export interface AIGenerationOptions {
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  messages?: AIMessage[]
}

export abstract class BaseAIService {
  protected abstract providerName: string
  protected abstract apiKey: string
  protected abstract defaultModel: string

  abstract generateText(prompt: string, options?: AIGenerationOptions): Promise<AIResponse>

  abstract generateWithMessages(
    messages: AIMessage[],
    options?: AIGenerationOptions
  ): Promise<AIResponse>

  protected validateApiKey(): void {
    if (!this.apiKey) {
      throw new Error(`${this.providerName} API key is not configured`)
    }
  }

  protected createSystemMessage(prompt: string): AIMessage {
    return {
      role: 'system',
      content: prompt,
    }
  }

  protected createUserMessage(content: string): AIMessage {
    return {
      role: 'user',
      content,
    }
  }

  protected getDefaultOptions(): Required<AIGenerationOptions> {
    return {
      temperature: 0.7,
      maxTokens:
        config.ai.providers[this.providerName as keyof typeof config.ai.providers]?.maxTokens ||
        4000,
      systemPrompt: config.ai.systemPrompts.tutor,
      messages: [],
    }
  }
}
