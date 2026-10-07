// The main screen, from photo to deadlines:
//   1. choose how the letter is read (Neil's choice: AI help, or phone only)
//   2. photograph it, and the phone reads the words
//   3. the two readers say what kind of letter it is (Neil's must-agree rule)
//   4. the user checks the facts (the confirm screen, with Neil's flags)
//   5. the countdowns and the plain-language explanation
//
// It uses the phone's own camera app (a file input with `capture`) instead of
// a live camera view inside the page. Two reasons: browsers only allow a live
// camera on https, and the phone's camera app already has focus, flash and
// zoom that people know how to use.
import { useEffect, useState } from 'react'
import { prepareImage } from './image'
import { readText, type OcrResult } from './ocr'
import { loadModel, predict, type Model } from './classify'
import { askReaderA, type Facts as AiFacts } from './readerA'
import { decide, type Decision } from './agree'
import { findFacts } from './localFacts'
import { fieldsFor, flagsFor, type ReadingMode } from './flags'
import { todayOnThisPhone } from './deadlines'
import Confirm from './Confirm'
import Countdowns from './Countdowns'
import Explanation from './Explanation'

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

// The reading choice is remembered on this phone. Storage can be blocked
// (private browsing), so every use is wrapped, and the app still works.
const MODE_KEY = 'replyby-reading-mode'
function loadMode(): ReadingMode | null {
  try {
    const saved = localStorage.getItem(MODE_KEY)
    return saved === 'ai' || saved === 'phone' ? saved : null
  } catch {
    return null
  }
}
function saveMode(mode: ReadingMode) {
  try {
    localStorage.setItem(MODE_KEY, mode)
  } catch {
    // Not saved; the user will be asked again next time.
  }
}

type Read = {
  ocr: OcrResult
  readerB: string
  readerA: string | null
  aiFacts: AiFacts | null
  decision: Decision
}

type Stage =
  | { name: 'idle' }
  | { name: 'reading'; progress: number }
  | { name: 'asking'; readerB: string }
  | { name: 'done'; read: Read }
  | { name: 'error'; message: string }

export default function Capture() {
  const [mode, setMode] = useState<ReadingMode | null>(loadMode)
  const [stage, setStage] = useState<Stage>({ name: 'idle' })
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  // When the two readers disagree, the user picks the letter type.
  const [picked, setPicked] = useState<string | null>(null)
  // The facts after the user has checked them on the confirm screen.
  const [confirmed, setConfirmed] = useState<Record<string, string | null> | null>(null)

  // A preview address made with createObjectURL holds memory until it is
  // released, so release the old one whenever the photo changes.
  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl)
    }
  }, [photoUrl])

  function chooseMode(choice: ReadingMode) {
    saveMode(choice)
    setMode(choice)
  }

  async function handlePhoto(file: Blob) {
    setStage({ name: 'reading', progress: 0 })
    setPicked(null)
    setConfirmed(null)
    try {
      const image = await prepareImage(file)
      setPhotoUrl(URL.createObjectURL(image))
      const ocr = await readText(image, (progress) => setStage({ name: 'reading', progress }))
      // Reader B: Neil's classifier, running on the phone.
      model ??= await loadModel()
      const readerB = predict(model, ocr.text).letterType
      // Reader A: the AI, through the backend, only if the user allowed it.
      let aiFacts: AiFacts | null = null
      if (mode === 'ai') {
        setStage({ name: 'asking', readerB })
        aiFacts = (await askReaderA(ocr.text))?.facts ?? null
      }
      const readerA = (aiFacts?.letter_type as string | null | undefined) ?? null
      // Neil's must-agree rule decides what happens next.
      setStage({ name: 'done', read: { ocr, readerB, readerA, aiFacts, decision: decide(readerA, readerB) } })
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
    setPicked(null)
    setConfirmed(null)
    setStage({ name: 'idle' })
  }

  if (stage.name === 'idle' || stage.name === 'error') {
    if (!mode) return <ModeChoice onChoose={chooseMode} />
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
        <p className="hint">
          Reading with: <strong>{mode === 'ai' ? 'AI help' : 'your phone only'}</strong>.{' '}
          <button className="link" onClick={() => setMode(null)}>
            Change
          </button>
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
        <AfterReading
          read={stage.read}
          mode={mode ?? 'phone'}
          picked={picked}
          onPick={(type) => {
            setPicked(type)
            setConfirmed(null)
          }}
          confirmed={confirmed}
          onConfirm={setConfirmed}
        />
      )}

      {stage.name === 'done' && (
        <>
          <details className="card">
            <summary>What the app read</summary>
            <p className="meta">Reader A (AI): {stage.read.readerA ? plain(stage.read.readerA) : 'not used'}</p>
            <p className="meta">Reader B (classifier): {plain(stage.read.readerB)}</p>
            <p className="meta">Photo reading confidence: {Math.round(stage.read.ocr.confidence)}%</p>
            <pre className="ocr-text">{stage.read.ocr.text.trim() || 'No words found in this photo.'}</pre>
          </details>
          <button className="button" onClick={startOver}>
            Try another photo
          </button>
        </>
      )}
    </section>
  )
}

// Everything after both readers have answered.
function AfterReading(props: {
  read: Read
  mode: ReadingMode
  picked: string | null
  onPick: (type: string) => void
  confirmed: Record<string, string | null> | null
  onConfirm: (facts: Record<string, string | null>) => void
}) {
  const { read, mode, picked, confirmed } = props
  const letterType = read.decision.status === 'ask' ? picked : read.decision.letterType
  const handled = letterType && letterType !== 'OTHER'

  return (
    <>
      <DecisionCard decision={read.decision} mode={mode} picked={picked} onPick={props.onPick} />
      {letterType === 'OTHER' && read.decision.status !== 'not_handled' && <NotHandled />}
      {handled && !confirmed && <CheckFacts read={read} mode={mode} letterType={letterType} onConfirm={props.onConfirm} />}
      {handled && confirmed && (
        <>
          <Countdowns letterType={letterType} facts={confirmed} />
          {mode === 'ai' ? (
            <Explanation facts={{ letter_type: letterType, ...confirmed }} />
          ) : (
            <p className="hint">
              A plain-language explanation needs AI help. You chose to keep everything on your phone.
            </p>
          )}
        </>
      )}
    </>
  )
}

// Builds the confirm screen: the AI's facts where there are some, the
// phone's own finds for the rest, and the case number always from the phone
// (the AI never sees it).
function CheckFacts({ read, mode, letterType, onConfirm }: {
  read: Read
  mode: ReadingMode
  letterType: string
  onConfirm: (facts: Record<string, string | null>) => void
}) {
  const today = todayOnThisPhone()
  const fields = fieldsFor(letterType)
  const local = findFacts(read.ocr.text, letterType, today)
  const repaired = [...local.repaired]
  const facts: Record<string, string | null> = {}
  for (const field of fields) {
    const fromAi = field === 'case_number' ? null : read.aiFacts?.[field]
    const fromPhone = (local.facts as Record<string, string | null>)[field] ?? null
    if (typeof fromAi === 'string' && fromAi) {
      facts[field] = fromAi
    } else {
      facts[field] = fromPhone
      // In AI mode, a fact only the phone found is less sure, so check it.
      if (mode === 'ai' && fromPhone && field !== 'case_number') repaired.push(field)
    }
  }
  const flags = flagsFor({
    fields,
    facts,
    mode,
    certainty: (read.aiFacts?.certainty as string | undefined) ?? null,
    photoConfidence: read.ocr.confidence,
    repaired,
    today,
  })
  return <Confirm fields={fields} facts={facts} flags={flags} onConfirm={onConfirm} />
}

// Neil's choice before scanning.
function ModeChoice({ onChoose }: { onChoose: (mode: ReadingMode) => void }) {
  return (
    <section>
      <div className="card">
        <h2>How should we read your letter?</h2>
        <p className="meta">You can change this later.</p>
      </div>
      <button className="choice" onClick={() => onChoose('ai')}>
        <strong>Let AI help read it</strong>
        <span>
          The words from your letter are sent to an AI to read, with your name, address and case number
          blanked out first. Faster and more accurate.
        </span>
      </button>
      <button className="choice" onClick={() => onChoose('phone')}>
        <strong>Keep everything on my phone</strong>
        <span>Nothing leaves your phone. You will need to check every fact yourself.</span>
      </button>
    </section>
  )
}

function NotHandled() {
  return (
    <div className="card">
      <h2>Sorry, this is not one of the letters we handle</h2>
      <p>This app works with renewal forms, requests for information, and notices that stop coverage.</p>
    </div>
  )
}

// Shows the user what Neil's must-agree rule decided.
function DecisionCard({ decision, mode, picked, onPick }: {
  decision: Decision
  mode: ReadingMode
  picked: string | null
  onPick: (type: string) => void
}) {
  if (decision.status === 'agree') {
    return (
      <div className="card">
        <h2>This letter is</h2>
        <p className="answer">{plain(decision.letterType!)}</p>
      </div>
    )
  }
  if (decision.status === 'confirm') {
    if (decision.letterType === 'OTHER') return null
    return (
      <div className="card">
        <h2>We think this letter is</h2>
        <p className="answer">{plain(decision.letterType!)}</p>
        <p>
          Please make sure. Only one reader checked it, because{' '}
          {mode === 'phone' ? 'you chose to keep everything on your phone.' : 'the AI could not be reached.'}
        </p>
      </div>
    )
  }
  if (decision.status === 'not_handled') return <NotHandled />
  return (
    <div className="card">
      <h2>We could not identify the letter</h2>
      <p>Which one is it?</p>
      {decision.choices.map((choice) => (
        <button
          key={choice}
          className={`button ${picked === choice ? 'primary' : ''}`}
          onClick={() => onPick(choice)}
        >
          {plain(choice)}
        </button>
      ))}
    </div>
  )
}
