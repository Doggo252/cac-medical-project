// Copies the text-reading (OCR) engine out of node_modules into public/, so
// the app serves those files itself. By default Tesseract.js downloads them
// from the internet, which would break the rule that reading a letter works
// in airplane mode. Runs by itself before `npm run dev` and `npm run build`.
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const app = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(app, 'public', 'tesseract')
mkdirSync(join(out, 'lang'), { recursive: true })

const files = [
  ['node_modules/tesseract.js/dist/worker.min.js', 'worker.min.js'],
  // Three builds of the engine. The browser picks the fastest one it supports.
  ['node_modules/tesseract.js-core/tesseract-core-lstm.wasm.js', 'tesseract-core-lstm.wasm.js'],
  ['node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js'],
  ['node_modules/tesseract.js-core/tesseract-core-relaxedsimd-lstm.wasm.js', 'tesseract-core-relaxedsimd-lstm.wasm.js'],
  // What English letters and words look like.
  ['node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz', 'lang/eng.traineddata.gz'],
]
for (const [from, to] of files) copyFileSync(join(app, from), join(out, to))
console.log(`OCR files copied to public/tesseract (${files.length} files)`)
