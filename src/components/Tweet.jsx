
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  toggleLike,
  toggleRetweet,
  getComments,
  createComment,
} from "../services/api";

function getRelativeTime(date) {
  const publishedAt = new Date(date);

  if (Number.isNaN(publishedAt.getTime())) {
    return "";
  }

  const differenceInSeconds = Math.floor(
    (Date.now() - publishedAt.getTime()) / 1000
  );

  if (differenceInSeconds < 60) {
    return "ahora";
  }

  const minutes = Math.floor(differenceInSeconds / 60);

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} h`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} d`;
  }

  const weeks = Math.floor(days / 7);

  if (weeks < 5) {
    return `${weeks} sem`;
  }

  return publishedAt.toLocaleDateString("es-CO");
}

function formatDateTime(date) {
  const publishedAt = new Date(date);

  if (Number.isNaN(publishedAt.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(publishedAt);
}

function Tweet({ post }) {
  const authorName =
    post.authorName || post.author?.fullName || post.author || "Usuario";

  const authorUsername =
    post.authorUsername ||
    post.author?.username ||
    post.author ||
    "usuario";

  const initial = String(authorName).charAt(0).toUpperCase();

  const [liked, setLiked] = useState(Boolean(post.likedByMe));
  const [likesCount, setLikesCount] = useState(
    Number(post.likesCount ?? post.likes ?? 0)
  );

  const [retweeted, setRetweeted] = useState(
    Boolean(post.retweetedByMe)
  );
  const [retweetsCount, setRetweetsCount] = useState(
    Number(post.retweetsCount ?? 0)
  );

  const [commentsCount, setCommentsCount] = useState(
    Number(post.commentsCount ?? 0)
  );
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentContent, setCommentContent] = useState("");

  const [likeLoading, setLikeLoading] = useState(false);
  const [retweetLoading, setRetweetLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLike() {
    if (likeLoading) return;

    setLikeLoading(true);
    setError("");

    try {
      const result = await toggleLike(post.id);
      setLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch (error) {
      setError(error.message || "No se pudo actualizar el Me gusta.");
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleRetweet() {
    if (retweetLoading) return;

    setRetweetLoading(true);
    setError("");

    try {
      const result = await toggleRetweet(post.id);
      setRetweeted(result.retweeted);
      setRetweetsCount(result.retweetsCount);
    } catch (error) {
      setError(error.message || "No se pudo actualizar el retweet.");
    } finally {
      setRetweetLoading(false);
    }
  }

  async function handleToggleComments() {
    const shouldOpen = !commentsOpen;

    setCommentsOpen(shouldOpen);
    setError("");

    if (shouldOpen && !commentsLoaded) {
      setCommentsLoading(true);

      try {
        const result = await getComments(post.id);
        setComments(result.items || []);
        setCommentsLoaded(true);
      } catch (error) {
        setError(error.message || "No se pudieron cargar los comentarios.");
      } finally {
        setCommentsLoading(false);
      }
    }
  }

  async function handleSubmitComment(event) {
    event.preventDefault();

    const content = commentContent.trim();

    if (!content || commentLoading) return;

    setCommentLoading(true);
    setError("");

    try {
      const newComment = await createComment(post.id, content);

      setComments((currentComments) => [
        ...currentComments,
        newComment,
      ]);

      setCommentsLoaded(true);
      setCommentsCount((count) => count + 1);
      setCommentContent("");
      setCommentsOpen(true);
    } catch (error) {
      setError(error.message || "No se pudo publicar el comentario.");
    } finally {
      setCommentLoading(false);
    }
  }

  return (
    <article className="post">
      <div className="post__body">
        {post.retweetedBy && (
          <div className="post__retweeted-label">
            <span aria-hidden="true">↻</span>
            <span>@{post.retweetedBy} republicó</span>
          </div>
        )}

        <div className="post__tweet-content">
          <div className="post__avatar" aria-hidden="true">
            {initial}
          </div>

          <div className="post__main">
            <div className="post__author">
              <strong className="post__author-name">
                <Link to={`/users/${encodeURIComponent(authorUsername)}`}>
                  {authorName}
                </Link>
              </strong>

              <span className="post__metadata">
                <Link to={`/users/${encodeURIComponent(authorUsername)}`}>
                  @{authorUsername}
                </Link>
                {" · "}
                {formatDateTime(post.createdAt)}
              </span>
            </div>

            <p className="post__content">{post.content}</p>

            <div
              className="post__actions"
              aria-label="Acciones de la publicación"
            >
              <button
                type="button"
                className={`post__action post__action--like ${
                  liked ? "is-active" : ""
                }`}
                onClick={handleLike}
                disabled={likeLoading}
                aria-pressed={liked}
                aria-label={liked ? "Quitar Me gusta" : "Me gusta"}
                title={liked ? "Quitar Me gusta" : "Me gusta"}
              >
                <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
                <span>{likesCount}</span>
              </button>

              <button
                type="button"
                className={`post__action post__action--retweet ${
                  retweeted ? "is-retweeted" : ""
                }`}
                onClick={handleRetweet}
                disabled={retweetLoading}
                aria-pressed={retweeted}
                aria-label={retweeted ? "Deshacer retweet" : "Republicar"}
                title={retweeted ? "Deshacer retweet" : "Republicar"}
              >
                <span aria-hidden="true">↻</span>
                <span>{retweetsCount}</span>
              </button>

              <button
                type="button"
                className={`post__action ${
                  commentsOpen ? "is-comments-open" : ""
                }`}
                onClick={handleToggleComments}
                aria-expanded={commentsOpen}
                aria-label="Ver comentarios"
                title="Comentarios"
              >
                <span aria-hidden="true">▢</span>
                <span>{commentsCount}</span>
              </button>
            </div>

            {error && (
              <p className="post__error" role="alert">
                {error}
              </p>
            )}

            {commentsOpen && (
              <section
                className="post__comments"
                aria-label="Conversación"
              >
                {commentsLoading && (
                  <p className="post__comments-status">
                    Cargando comentarios...
                  </p>
                )}

                {!commentsLoading && !error && comments.length === 0 && (
                  <p className="post__empty-comments">
                    Todavía no hay respuestas. ¡Sé el primero!
                  </p>
                )}

                {comments.map((comment) => (
                  <div className="post__comment" key={comment.id}>
                    <div
                      className="post__comment-avatar"
                      aria-hidden="true"
                    >
                      {(comment.fullName || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="post__comment-body">
                      <div className="post__comment-author">
                        <strong>{comment.fullName || "Usuario"}</strong>

                        <span className="post__metadata">
                          @{comment.username || "usuario"}
                        </span>

                        {comment.createdAt && (
                          <span className="post__metadata">
                            {" · "}
                            {getRelativeTime(comment.createdAt)}
                          </span>
                        )}
                      </div>

                      <p>{comment.content}</p>
                    </div>
                  </div>
                ))}

                <form
                  className="post__comment-form"
                  onSubmit={handleSubmitComment}
                >
                  <input
                    type="text"
                    value={commentContent}
                    onChange={(event) =>
                      setCommentContent(event.target.value)
                    }
                    placeholder="Publica tu respuesta"
                    maxLength={280}
                    aria-label="Contenido del comentario"
                  />

                  <button
                    type="submit"
                    disabled={!commentContent.trim() || commentLoading}
                  >
                    {commentLoading ? "Enviando..." : "Responder"}
                  </button>
                </form>
              </section>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default Tweet;
