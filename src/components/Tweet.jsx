
function Tweet({ post }) {
  return (
    <article className="post">
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
  )
}

export default Tweet
