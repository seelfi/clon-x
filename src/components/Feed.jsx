import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import '../styles/Feed.css'

function Feed() {
  const { posts, setPosts } = useOutletContext()
  const [content, setContent] = useState('')

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
  }

  return (
    <main className="feed">
      <header className="feed__header">
        <h1>Inicio</h1>

        <div className="feed__tabs">
          <button className="feed__tab feed__tab--active" type="button">
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

      {posts.map((post) => (
        <article className="post" key={post.id}>
          <div className="post__avatar">
            {post.author.charAt(0).toUpperCase()}
          </div>

          <div className="post__body">
            <div className="post__author">
              <strong>{post.author}</strong>
              <span>@{post.author} · ahora</span>
            </div>

            <p>{post.content}</p>

            <div className="post__actions">
              <span>♡ {post.likes}</span>
              <span>↻ 0</span>
              <span>💬 0</span>
            </div>
          </div>
        </article>
      ))}
    </main>
  )
}

export default Feed