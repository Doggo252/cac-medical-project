// The first real screen: photograph a letter and read the words off it.
//
// It uses the phone's own camera app (a file input with `capture`) instead of
// a live camera view inside the page. Two reasons: browsers only allow a live
// camera on https, and the phone's camera app already has focus, flash and
// zoom that people know how to use.
import { useEffect, useState } from 'react'
import { prepareImage } from './image'
import { readText, type OcrResult } from './ocr'

type Stage =
  | { name: 'idle' }
  | { name: 'reading'; progress: number }
  | { name: 'done'; result: OcrResult }
  | { name: 'error'; message: string }

export default function Capture() {
  const [stage, setStage] = useState<Stage>({ name: 'idle' })
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  // A preview address made with createObjectURL holds memory until it is
  // released, so release the old one whenever the photo changes.
  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl)
    }
  }, [photoUrl])

  async function handlePhoto(file: Blob) {
    setStage({ name: 'reading', progress: 0 })
    try {
      const image = await prepareImage(file)
      setPhotoUrl(URL.createObjectURL(image))
      const result = await readText(image, (progress) => setStage({ name: 'reading', progress }))
      setStage({ name: 'done', result })
    } catch (error) {
      console.error(error)
      setStage({ name: 'error', message: 'Could not read that photo. Please try again.' })
    }
  }

  function handleFileInput(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Clear the input so picking the same photo twice still counts as a change.
    event.target.value = ''
    if (file) handlePhoto(file)
  }

  // Only while developing: read a built-in fake letter, for computers with
  // no camera.
  async function useSampleLetter() {
    const response = await fetch('/sample-letter.jpg')
    handlePhoto(await response.blob())
  }

  function startOver() {
    setPhotoUrl(null)
    setStage({ name: 'idle' })
  }

  if (stage.name === 'idle' || stage.name === 'error') {
    return (
      <section>
        {stage.name === 'error' && <p className="error">{stage.message}</p>}
        <label className="button primary">
          Take a photo of your letter
          <input type="file" accept="image/*" capture="environment" onChange={handleFileInput} hidden />
        </label>
        <label className="button">
          Choose a photo
          <input type="file" accept="image/*" onChange={handleFileInput} hidden />
        </label>
        {import.meta.env.DEV && (
          <button className="button quiet" onClick={useSampleLetter}>
            Use a sample letter (dev only)
          </button>
        )}
        <p className="hint">
          Lay the letter flat in good light and fit the whole page in the picture. The photo stays on
          your phone.
        </p>
      </section>
    )
  }

  return (
    <section>
      {photoUrl && <img className="photo" src={photoUrl} alt="Your letter" />}

      {stage.name === 'reading' && (
        <div className="card">
          <h2>Reading your letter…</h2>
          <progress value={stage.progress} max={1} />
          <p>{Math.round(stage.progress * 100)}%. This takes a few seconds.</p>
        </div>
      )}

      {stage.name === 'done' && (
        <>
          <div className="card">
            <h2>What the app read</h2>
            <p className="meta">Reader confidence: {Math.round(stage.result.confidence)}%</p>
            <pre className="ocr-text">{stage.result.text.trim() || 'No words found in this photo.'}</pre>
          </div>
          <button className="button" onClick={startOver}>
            Try another photo
          </button>
        </>
      )}
    </section>
  )
}
