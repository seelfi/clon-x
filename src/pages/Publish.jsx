import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTweet } from '../services/api'
import '../styles/Publish.css'

function Publish() {
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const maxCharacters = 280
  const remainingCharacters = maxCharacters - content.length

  function handleChange(event) {
    setContent(event.target.value)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const trimmedContent = content.trim()

    if (!trimmedContent || trimmedContent.length > maxCharacters) {
      return
    }

    setError('')
    setLoading(true)

    try {
      await createTweet(trimmedContent)

      setContent('')
      navigate('/')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="publish-page">
      <section className="publish-container">
        <h1>Publicar un tweet</h1>

        <form
          className="publish-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="tweet-content">
            ¿Qué está pasando?
          </label>

          <textarea
            id="tweet-content"
            value={content}
            onChange={handleChange}
            maxLength={maxCharacters}
            placeholder="¡Comparte lo que está pasando!"
            rows={5}
          />

          <div className="publish-footer">
            <span>
              Caracteres restantes: {remainingCharacters}
            </span>

            <button
              type="submit"
              disabled={!content.trim() || loading}
            >
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}
        </form>
      </section>
    </main>
  )
}

export default Publish