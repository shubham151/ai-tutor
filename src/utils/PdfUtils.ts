export class PDFUtils {
  static convertToCanvasCoordinates(
    normalizedCoords: { x: number; y: number; width: number; height: number },
    canvasWidth: number,
    canvasHeight: number
  ) {
    return {
      x: normalizedCoords.x * canvasWidth,
      y: normalizedCoords.y * canvasHeight,
      width: normalizedCoords.width * canvasWidth,
      height: normalizedCoords.height * canvasHeight,
    }
  }

  static convertToNormalizedCoordinates(
    canvasCoords: { x: number; y: number },
    canvasWidth: number,
    canvasHeight: number
  ) {
    return {
      x: canvasCoords.x / canvasWidth,
      y: canvasCoords.y / canvasHeight,
    }
  }

  static getErrorMessage(error: any): string {
    if (error.name === 'InvalidPDFException') {
      return 'Invalid PDF file format.'
    } else if (error.name === 'MissingPDFException') {
      return 'PDF file not found.'
    } else if (error.name === 'UnexpectedResponseException') {
      return 'Unable to access PDF file. Please check your connection.'
    }
    return 'Failed to load PDF. Please try again.'
  }
}
