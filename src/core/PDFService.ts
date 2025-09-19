// app/core/pdf-service.ts
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'

// Initialize PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
}

interface Annotation {
  pageNumber: number
  x: number
  y: number
  width: number
  height: number
  type: 'highlight' | 'circle' | 'arrow'
  color: string
}

function createLoadingTask(fileUrl: string) {
  return pdfjsLib.getDocument({
    url: fileUrl,
    cMapUrl: '//cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
  })
}

function createRenderContext(canvas: HTMLCanvasElement, viewport: any) {
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas context not available')

  return {
    canvasContext: context,
    viewport: viewport,
  }
}

function convertPDFCoordinates(annotation: Annotation, viewport: any) {
  return {
    x: annotation.x * viewport.width,
    y: (1 - annotation.y) * viewport.height,
    width: annotation.width * viewport.width,
    height: annotation.height * viewport.height,
  }
}

function renderHighlight(context: CanvasRenderingContext2D, coords: any, color: string) {
  context.fillStyle = color ? `${color}40` : '#ff000040'
  context.fillRect(coords.x, coords.y - coords.height, coords.width, coords.height)
}

function renderCircle(context: CanvasRenderingContext2D, coords: any) {
  context.beginPath()
  context.ellipse(
    coords.x + coords.width / 2,
    coords.y - coords.height / 2,
    coords.width / 2,
    coords.height / 2,
    0,
    0,
    2 * Math.PI
  )
  context.stroke()
}

function renderArrow(context: CanvasRenderingContext2D, coords: any) {
  context.beginPath()
  context.moveTo(coords.x, coords.y)
  context.lineTo(coords.x + coords.width, coords.y - coords.height)
  context.stroke()
}

function renderAnnotation(
  context: CanvasRenderingContext2D,
  annotation: Annotation,
  viewport: any
) {
  const coords = convertPDFCoordinates(annotation, viewport)

  context.save()
  context.strokeStyle = annotation.color || '#ff0000'
  context.lineWidth = 2

  switch (annotation.type) {
    case 'highlight':
      renderHighlight(context, coords, annotation.color)
      break
    case 'circle':
      renderCircle(context, coords)
      break
    case 'arrow':
      renderArrow(context, coords)
      break
  }

  context.restore()
}

async function loadDocument(fileUrl: string) {
  try {
    const loadingTask = createLoadingTask(fileUrl)
    return await loadingTask.promise
  } catch (error: any) {
    let errorMessage = 'Failed to load PDF. Please try again.'

    if (error.name === 'InvalidPDFException') {
      errorMessage = 'Invalid PDF file format.'
    } else if (error.name === 'MissingPDFException') {
      errorMessage = 'PDF file not found.'
    } else if (error.name === 'UnexpectedResponseException') {
      errorMessage = 'Unable to access PDF file. Please check your connection.'
    }

    throw new Error(errorMessage)
  }
}

async function renderPage(
  pdfDoc: any,
  pageNum: number,
  canvas: HTMLCanvasElement,
  scale: number,
  rotation: number,
  annotations: Annotation[] = []
) {
  const page = await pdfDoc.getPage(pageNum)
  const context = canvas.getContext('2d')

  if (!context) throw new Error('Canvas context not available')

  const viewport = page.getViewport({ scale, rotation })

  canvas.height = viewport.height
  canvas.width = viewport.width

  context.clearRect(0, 0, canvas.width, canvas.height)

  const renderContext = createRenderContext(canvas, viewport)
  await page.render(renderContext).promise

  // Render annotations for current page
  const pageAnnotations = annotations.filter((ann) => ann.pageNumber === pageNum)
  pageAnnotations.forEach((annotation) => {
    renderAnnotation(context, annotation, viewport)
  })
}

function handlePDFError(error: any): string {
  console.error('PDF error:', error)

  if (error.name === 'InvalidPDFException') {
    return 'Invalid PDF file format.'
  } else if (error.name === 'MissingPDFException') {
    return 'PDF file not found.'
  } else if (error.name === 'UnexpectedResponseException') {
    return 'Unable to access PDF file. Please check your connection.'
  }

  return 'Failed to process PDF. Please try again.'
}

const PDFService = {
  loadDocument,
  renderPage,
  handlePDFError,
}

export default PDFService
