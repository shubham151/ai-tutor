import { useRef, useCallback } from 'react'

export function usePDFRenderer() {
  const renderTaskRef = useRef<any>(null)

  const renderPage = useCallback(
    async (
      pdfDoc: any,
      pageNum: number,
      canvas: HTMLCanvasElement,
      scale: number,
      rotation: number
    ) => {
      if (!canvas || !pdfDoc) return

      // Cancel previous render if it's still running
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
      }

      try {
        const page = await pdfDoc.getPage(pageNum)
        const context = canvas.getContext('2d')

        if (!context) return

        const viewport = page.getViewport({
          scale: scale,
          rotation: rotation,
        })

        canvas.height = viewport.height
        canvas.width = viewport.width

        context.clearRect(0, 0, canvas.width, canvas.height)

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        }

        renderTaskRef.current = page.render(renderContext)
        await renderTaskRef.current.promise

        renderTaskRef.current = null
      } catch (err: any) {
        if (err.name === 'RenderingCancelledException') {
          console.log('Rendering was cancelled.')
          return
        }
        throw err
      }
    },
    []
  )

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
    }
  }, [])

  return { renderPage, cleanup }
}
