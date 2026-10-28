
import { useEffect, useState } from "react";
import Tweet from "./Tweet";
import { getFeed } from "../services/api";
import "../styles/Feed.css";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const postsPerPage = 10;

  useEffect(() => {
    async function loadFeed() {
      setLoading(true);
      setError("");

      try {
        const data = await getFeed(currentPage, postsPerPage);

        const formattedPosts = data.items.map((tweet) => ({
          id: tweet.id,
          author: tweet.author.username,
          authorName: tweet.author.fullName,
          authorUsername: tweet.author.username,
          content: tweet.content,
          likes: 0,
          createdAt: tweet.createdAt,
        }));

        setPosts(formattedPosts);
        setTotalPages(data.totalPages);
      } catch (error) {
        setError(error.message || "No fue posible cargar las publicaciones.");
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, [currentPage]);

  function handlePreviousPage() {
    setCurrentPage((page) => page - 1);
  }

  function handleNextPage() {
    setCurrentPage((page) => page + 1);
  }

  if (loading) {
    return (
      <main className="feed">
        <header className="feed__header">
          <h1>Inicio</h1>
        </header>

        <div className="feed__status" role="status">
          <div className="feed__status-icon" aria-hidden="true">
            ↻
          </div>
          <h2>Cargando tu inicio</h2>
          <p>Estamos buscando las publicaciones para ti.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="feed">
        <header className="feed__header">
          <h1>Inicio</h1>
        </header>

        <div className="feed__status" role="alert">
          <div className="feed__status-icon" aria-hidden="true">
            !
          </div>
          <h2>No pudimos cargar el inicio</h2>
          <p>{error}</p>
        </div>
      </main>
    );
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

      {posts.length === 0 ? (
        <div className="feed__status">
          <div className="feed__status-icon" aria-hidden="true">
            ✧
          </div>
          <h2>Tu próxima conversación empieza aquí</h2>
          <p>
            Todavía no hay publicaciones para mostrar. Puedes compartir
            una idea o seguir a otras personas para descubrir contenido.
          </p>
        </div>
      ) : (
        posts.map((post) => <Tweet key={post.id} post={post} />)
      )}

      {totalPages > 1 && (
        <nav
          className="pagination"
          aria-label="Paginación de publicaciones"
        >
          <button
            type="button"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Anterior
          </button>

          <span>
            Página {currentPage} de {totalPages}
          </span>

          <button
            type="button"
            onClick={handleNextPage}
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
