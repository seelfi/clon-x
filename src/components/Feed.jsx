
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import Tweet from './Tweet'
import '../styles/Feed.css'

function Feed() {
  const { posts, setPosts } = useOutletContext()
  const [content, setContent] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const postsPerPage = 10
  const totalPages = Math.ceil(posts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const visiblePosts = posts.slice(
    startIndex,
    startIndex + postsPerPage
  )

  function handlePublish() {
    const trimmedContent = content.trim()

    if (!trimmedContent || trimmedContent.length > 280) {
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
    setCurrentPage(1)
  }

  return (
    <main className="feed">
      <header className="feed__header">
        <h1>Inicio</h1>

        <div className="feed__tabs">
          <button
            className="feed__tab feed__tab--active"
            type="button"
          >
            Para ti
          </button>

          <button className="feed__tab" type="button">
            Siguiendo
          </button>
        </div>
      </header>

      <section className="composer">
        <div className="composer__avatar">P</div>

        <div className="composer__content">
          <textarea
            placeholder="¿Qué está pasando?"
            aria-label="Escribe una publicación"
            value={content}
            maxLength={280}
            onChange={(event) => setContent(event.target.value)}
          />

          <div className="composer__actions">
            <span>{content.length}/280 caracteres</span>

            <button
              type="button"
              onClick={handlePublish}
              disabled={!content.trim()}
            >
              Publicar
            </button>
          </div>
        </div>
      </section>

      {visiblePosts.map((post) => (
        <Tweet key={post.id} post={post} />
      ))}

      {totalPages > 1 && (
        <nav
          className="pagination"
          aria-label="Paginación de publicaciones"
        >
          <button
            type="button"
            onClick={() => setCurrentPage((page) => page - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>

          <span>
            Página {currentPage} de {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((page) => page + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </nav>
      )}
    </main>
  )
}

export default Feed
