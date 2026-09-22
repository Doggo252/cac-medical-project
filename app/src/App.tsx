import Capture from './Capture'

export default function App() {
  return (
    <main className="screen">
      <header>
        <h1>ReplyBy</h1>
        <p className="tagline">
          Photograph a Medi-Cal letter. See what it means, when it is due, and send the response.
        </p>
      </header>
      <Capture />
    </main>
  )
}
