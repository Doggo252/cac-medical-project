// Gets a photo ready for text reading (OCR).
//
// Phone cameras take huge photos (12 million pixels or more). The text reader
// does not need that much detail, and it gets very slow on big pictures. So
// the photo is shrunk first. It never leaves the phone.

// Longest side, in pixels, of the picture handed to the text reader. A letter
// page at this size still has small print about 20 pixels tall, which is
// plenty.
export const MAX_SIDE = 2200

// Works out the new width and height so the longest side is at most maxSide,
// keeping the same shape. Small pictures are left alone, never blown up.
export function fitWithin(width: number, height: number, maxSide: number) {
  const longest = Math.max(width, height)
  if (longest <= maxSide) return { width, height }
  const scale = maxSide / longest
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

// Shrinks the photo and returns it as a JPEG.
export async function prepareImage(file: Blob): Promise<Blob> {
  // createImageBitmap also turns the photo the right way up, using the
  // rotation note the phone camera saved with it.
  const bitmap = await createImageBitmap(file)
  const { width, height } = fitWithin(bitmap.width, bitmap.height, MAX_SIDE)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not process the photo.'))),
      'image/jpeg',
      0.9
    )
  })
}
