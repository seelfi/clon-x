import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Tweet from "./Tweet";
import "../styles/Feed.css";

function Feed() {
  const { posts, setPosts, followingUsernames, setFollowingUsernames } =
    useOutletContext();

  const [usernameToFollow, setUsernameToFollow] = useState("");
  const [followMessage, setFollowMessage] = useState("");
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const postsPerPage = 10;
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const visiblePosts = posts.slice(startIndex, startIndex + postsPerPage);

  function handlePublish() {
    const trimmedContent = content.trim();

    if (!trimmedContent || trimmedContent.length > 280) {
      return;
    }

    const newPost = {
      id: Date.now(),
      author: "pablo_dev",
      content: trimmedContent,
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    setPosts((currentPosts) => [newPost, ...currentPosts]);
    setContent("");
    setCurrentPage(1);
  }

  function handleFollow() {
    const username = usernameToFollow.trim().replace(/^@/, "");

    if (!username) {
      setFollowMessage("Escribe un nombre de usuario.");
      return;
    }

    if (username === "pablo_dev") {
      setFollowMessage("No puedes seguirte a ti mismo.");
      return;
    }

    const userExists = posts.some((post) => post.author === username);

    if (!userExists) {
      setFollowMessage("No encontramos ese usuario.");
      return;
    }

    if (followingUsernames.includes(username)) {
      setFollowMessage("Ya sigues a ese usuario.");
      return;
    }

    setFollowingUsernames((currentUsernames) => [
      ...currentUsernames,
      username,
    ]);

    setFollowMessage(`Ahora sigues a @${username}.`);
    setUsernameToFollow("");
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

      {visiblePosts.map((post) => (
        <Tweet key={post.id} post={post} />
      ))}

      {totalPages > 1 && (
        <nav className="pagination" aria-label="Paginación de publicaciones">
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
  );
}

export default Feed;
