export class FileValidator {
  static readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  static readonly ALLOWED_TYPE = 'application/pdf'

  static validateFile(file: File): { isValid: boolean; error?: string } {
    if (file.type !== this.ALLOWED_TYPE) {
      return { isValid: false, error: 'Please select a PDF file' }
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return { isValid: false, error: 'File size must be less than 10MB' }
    }

    return { isValid: true }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}
