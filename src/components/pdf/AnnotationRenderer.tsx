import React from 'react'
import { Annotation } from '@/types/pdf'
import { PDFUtils } from '@/utils/PdfUtils'

interface AnnotationRendererProps {
  annotations: Annotation[]
  currentPage: number
  canvasWidth: number
  canvasHeight: number
  context: CanvasRenderingContext2D
}

export class AnnotationRenderer {
  static render({
    annotations,
    currentPage,
    canvasWidth,
    canvasHeight,
    context,
  }: AnnotationRendererProps) {
    context.clearRect(0, 0, canvasWidth, canvasHeight)

    const pageAnnotations = annotations.filter((ann) => ann.pageNumber === currentPage)

    console.log(`Rendering ${pageAnnotations.length} annotations for page ${currentPage}`)

    pageAnnotations.forEach((annotation) => {
      context.save()

      const coords = PDFUtils.convertToCanvasCoordinates(annotation, canvasWidth, canvasHeight)

      context.strokeStyle = annotation.color || '#ff0000'
      context.lineWidth = 2
      context.fillStyle = annotation.color ? `${annotation.color}66` : '#ff000066'

      this.renderAnnotationType(context, annotation.type, coords)

      context.restore()
    })
  }

  private static renderAnnotationType(
    context: CanvasRenderingContext2D,
    type: Annotation['type'],
    coords: { x: number; y: number; width: number; height: number }
  ) {
    const { x, y, width, height } = coords

    switch (type) {
      case 'highlight':
        context.fillRect(x, y, width, height)
        context.strokeRect(x, y, width, height)
        break
      case 'circle':
        context.beginPath()
        context.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI)
        context.fill()
        context.stroke()
        break
      case 'arrow':
        context.beginPath()
        context.moveTo(x, y + height)
        context.lineTo(x + width, y)
        context.lineTo(x + width * 0.8, y + height * 0.2)
        context.moveTo(x + width, y)
        context.lineTo(x + width * 0.8, y - height * 0.2)
        context.stroke()
        break
    }
  }
}
