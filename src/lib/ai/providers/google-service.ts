// lib/ai/providers/google-service.ts
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { BaseAIService, AIMessage, AIResponse, AIGenerationOptions } from '../base-service'
import config from '@/lib/config'

export class GoogleAIService extends BaseAIService {
  protected providerName = 'google'
  protected apiKey = config.ai.providers.google.apiKey
  protected defaultModel = config.ai.providers.google.model

  async generateText(prompt: string, options: AIGenerationOptions = {}): Promise<AIResponse> {
    this.validateApiKey()

    const defaultOptions = this.getDefaultOptions()
    const finalOptions = { ...defaultOptions, ...options }

    try {
      const result = await generateText({
        model: google(this.defaultModel),
        prompt,
        system: finalOptions.systemPrompt,
        temperature: finalOptions.temperature,
        maxRetries: 2,
      })

      return {
        content: result.text,
        usage: result.usage
          ? {
              promptTokens: result.usage.inputTokens || 0,
              completionTokens: result.usage.outputTokens || 0,
              totalTokens: result.usage.totalTokens || 0,
            }
          : undefined,
        model: this.defaultModel,
      }
    } catch (error) {
      throw new Error(
        `Google AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async generateWithMessages(
    messages: AIMessage[],
    options: AIGenerationOptions = {}
  ): Promise<AIResponse> {
    this.validateApiKey()

    const defaultOptions = this.getDefaultOptions()
    const finalOptions = { ...defaultOptions, ...options }

    try {
      const result = await generateText({
        model: google(this.defaultModel),
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        system: finalOptions.systemPrompt,
        temperature: finalOptions.temperature,
        maxRetries: 2,
      })

      return {
        content: result.text,
        usage: result.usage
          ? {
              promptTokens: result.usage.inputTokens || 0,
              completionTokens: result.usage.outputTokens || 0,
              totalTokens: result.usage.totalTokens || 0,
            }
          : undefined,
        model: this.defaultModel,
      }
    } catch (error) {
      throw new Error(
        `Google AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}
