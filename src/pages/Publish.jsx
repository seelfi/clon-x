import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import '../styles/Publish.css'

function Publish() {
  const [content, setContent] = useState('')
  const { setPosts } = useOutletContext()
  const navigate = useNavigate()

  const maxCharacters = 280
  const remainingCharacters = maxCharacters - content.length

  function handleChange(event) {
    setContent(event.target.value)
  }

  function handleSubmit(event) {
    event.preventDefault()

    const trimmedContent = content.trim()

    if (!trimmedContent || trimmedContent.length > maxCharacters) {
      return
    }

    const newPost = {
      id: Date.now(),
      author: 'pablo_dev',
      content: trimmedContent,
      likes: 0,
      createdAt: new Date().toISOString()
    }

    setPosts((currentPosts) => [newPost, ...currentPosts])
    setContent('')
    navigate('/')
  }

  return (
    <main className="publish-page">
      <section className="publish-container">
        <h1>Publicar un tweet</h1>

        <form className="publish-form" onSubmit={handleSubmit}>
          <label htmlFor="tweet-content">¿Qué está pasando?</label>

          <textarea
            id="tweet-content"
            value={content}
            onChange={handleChange}
            maxLength={maxCharacters}
            placeholder="¡Comparte lo que está pasando!"
            rows={5}
          />

          <div className="publish-footer">
            <span>Caracteres restantes: {remainingCharacters}</span>

            <button
              type="submit"
              disabled={!content.trim()}
            >
              Publicar
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default Publish