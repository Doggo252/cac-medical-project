// Reads the words off a photo, on the phone itself.
//
// OCR means "optical character recognition": turning a picture of text into
// actual text. This uses Tesseract.js. All of its files are served by this
// app (see scripts/copy-ocr-files.mjs), so it works with no internet and the
// photo never leaves the phone.
import { createWorker } from 'tesseract.js'

export type OcrResult = {
  text: string
  // How sure the reader is about the whole page, from 0 to 100.
  confidence: number
}

// onProgress gets a number from 0 to 1 while the reading happens.
export async function readText(image: Blob, onProgress: (done: number) => void): Promise<OcrResult> {
  const worker = await createWorker('eng', 1, {
    workerPath: '/tesseract/worker.min.js',
    corePath: '/tesseract',
    langPath: '/tesseract/lang',
    logger: (message) => {
      if (message.status === 'recognizing text') onProgress(message.progress)
    },
  })
  try {
    const result = await worker.recognize(image)
    return { text: result.data.text, confidence: result.data.confidence }
  } finally {
    // The reader uses a lot of memory, so shut it down when done.
    await worker.terminate()
  }
}
