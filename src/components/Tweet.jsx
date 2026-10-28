
function getRelativeTime(date) {
  const publishedAt = new Date(date)

  if (Number.isNaN(publishedAt.getTime())) {
    return ''
  }

  const differenceInSeconds = Math.floor(
    (Date.now() - publishedAt.getTime()) / 1000
  )

  if (differenceInSeconds < 60) {
    return 'ahora'
  }

  const minutes = Math.floor(differenceInSeconds / 60)

  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return `${hours} h`
  }

  const days = Math.floor(hours / 24)

  if (days < 7) {
    return `${days} d`
  }

  const weeks = Math.floor(days / 7)

  if (weeks < 5) {
    return `${weeks} sem`
  }

  return publishedAt.toLocaleDateString('es-CO')
}

function Tweet({ post }) {
  const authorName = post.authorName || post.author || 'Usuario'
  const authorUsername = post.authorUsername || post.author || 'usuario'
  const initial = authorName.charAt(0).toUpperCase()

  return (
    <article className="post">
      <div className="post__avatar" aria-hidden="true">
        {initial}
      </div>

      <div className="post__body">
        <div className="post__author">
          <strong className="post__author-name">{authorName}</strong>

          <span className="post__metadata">
            @{authorUsername} · {getRelativeTime(post.createdAt)}
          </span>
        </div>

        <p className="post__content">{post.content}</p>

        <div className="post__actions" aria-label="Acciones de la publicación">
          <span title="Me gusta">♡ {post.likes ?? 0}</span>
          <span title="Republicaciones">↻ 0</span>
          <span title="Respuestas">▢ 0</span>
        </div>
      </div>
    </article>
  )
}

export default Tweet
