export interface ParsedDocument {
  text: string
  pageCount: number
}

export async function parsePdf(file: File): Promise<ParsedDocument> {
  const [pdfjsLib, { default: pdfjsWorkerUrl }] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ])
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl

  const buffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data: buffer })

  try {
    const pdf = await loadingTask.promise

    const pageTexts: string[] = []
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      try {
        const content = await page.getTextContent()
        const pageText = content.items.map((item) => ('str' in item ? item.str : '')).join(' ')
        pageTexts.push(`\n[صفحة ${pageNumber}]\n${pageText}`)
      } finally {
        page.cleanup()
      }
    }

    return {
      text: pageTexts.join('\n'),
      pageCount: pdf.numPages,
    }
  } finally {
    // Releases the worker thread backing this document. Without this, every
    // parsed PDF leaks a dedicated Worker for the lifetime of the tab, and
    // enough leaked workers eventually starve new PDF.js worker creation —
    // later uploads then hang in "parsing" forever with no error surfaced.
    await loadingTask.destroy()
  }
}
