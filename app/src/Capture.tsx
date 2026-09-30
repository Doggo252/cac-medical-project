// The first real screen: photograph a letter and read the words off it.
//
// It uses the phone's own camera app (a file input with `capture`) instead of
// a live camera view inside the page. Two reasons: browsers only allow a live
// camera on https, and the phone's camera app already has focus, flash and
// zoom that people know how to use.
import { useEffect, useState } from 'react'
import { prepareImage } from './image'
import { readText, type OcrResult } from './ocr'
import { loadModel, predict, type Model } from './classify'
import { askReaderA, type Facts } from './readerA'
import { decide, type Decision } from './agree'

// Plain names for the letter types. Neil's rule: the user sees words like
// "request for more information", never codes like MC355.
const LETTER_NAMES: Record<string, string> = {
  MC_239A: 'A notice that your Medi-Cal is being stopped',
  MC355: 'A request for more information',
  MC210_RV: 'Your yearly renewal form',
  OTHER: 'Not one of the letters this app handles',
}
const plain = (type: string) => LETTER_NAMES[type] ?? type

// The model is loaded once and kept, since it never changes while the app runs.
let model: Model | null = null

type Stage =
  | { name: 'idle' }
  | { name: 'reading'; progress: number }
  | { name: 'asking'; result: OcrResult; readerB: string }
  | { name: 'done'; result: OcrResult; readerB: string; readerA: string | null; facts: Facts | null; decision: Decision }
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
      // Reader B: Neil's classifier, running on the phone.
      model ??= await loadModel()
      const readerB = predict(model, result.text).letterType
      setStage({ name: 'asking', result, readerB })
      // Reader A: the AI, through the backend. Null if offline.
      const fromA = await askReaderA(result.text)
      const readerA = fromA?.facts.letter_type ?? null
      // Neil's must-agree rule decides what happens next.
      const decision = decide(readerA, readerB)
      setStage({ name: 'done', result, readerB, readerA, facts: fromA?.facts ?? null, decision })
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

      {stage.name === 'asking' && (
        <div className="card">
          <h2>Checking with the second reader…</h2>
          <p>The first reader says: {plain(stage.readerB)}</p>
        </div>
      )}

      {stage.name === 'done' && (
        <>
          <DecisionCard decision={stage.decision} />
          <div className="card">
            <h2>Both readers</h2>
            <p className="meta">Reader A (AI): {stage.readerA ? plain(stage.readerA) : 'no answer (offline)'}</p>
            <p className="meta">Reader B (classifier): {plain(stage.readerB)}</p>
          </div>
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


// Shows the user what Neil's must-agree rule decided.
function DecisionCard({ decision }: { decision: Decision }) {
  if (decision.status === 'agree') {
    return (
      <div className="card">
        <h2>This letter is</h2>
        <p className="answer">{plain(decision.letterType!)}</p>
      </div>
    )
  }
  if (decision.status === 'confirm') {
    return (
      <div className="card">
        <h2>We think this letter is</h2>
        <p className="answer">{plain(decision.letterType!)}</p>
        <p>Please make sure. Only one reader could check it, because there is no internet.</p>
      </div>
    )
  }
  if (decision.status === 'not_handled') {
    return (
      <div className="card">
        <h2>Sorry, this is not one of the letters we handle</h2>
        <p>This app works with renewal forms, requests for information, and notices that stop coverage.</p>
      </div>
    )
  }
  return (
    <div className="card">
      <h2>We could not identify the letter</h2>
      <p>Which one is it?</p>
      {decision.choices.map((choice) => (
        <button key={choice} className="button">
          {plain(choice)}
        </button>
      ))}
    </div>
  )
}
