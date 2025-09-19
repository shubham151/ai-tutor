import { BaseAIService } from './base-service'
import { GoogleAIService } from './providers/google-service'
import config from '@/lib/config'

type AIProvider = 'google' | 'openai' | 'anthropic'

class AIServiceFactory {
  private services: Map<AIProvider, BaseAIService> = new Map()

  private createService(provider: AIProvider): BaseAIService {
    switch (provider) {
      case 'google':
        return new GoogleAIService()
      case 'openai':
        // return new OpenAIService() // To be implemented
        throw new Error('OpenAI service not yet implemented')
      case 'anthropic':
        // return new AnthropicService() // To be implemented
        throw new Error('Anthropic service not yet implemented')
      default:
        throw new Error(`Unsupported AI provider: ${provider}`)
    }
  }

  getService(provider?: AIProvider): BaseAIService {
    const selectedProvider = provider || config.ai.defaultProvider

    if (!this.services.has(selectedProvider)) {
      const service = this.createService(selectedProvider)
      this.services.set(selectedProvider, service)
    }

    return this.services.get(selectedProvider)!
  }

  getDefaultService(): BaseAIService {
    return this.getService()
  }

  getAllAvailableProviders(): AIProvider[] {
    return ['google'] // Add more as they're implemented
  }

  isProviderAvailable(provider: AIProvider): boolean {
    try {
      const service = this.createService(provider)
      service['validateApiKey']() // Call protected method
      return true
    } catch {
      return false
    }
  }
}

export const aiFactory = new AIServiceFactory()
export default aiFactory
