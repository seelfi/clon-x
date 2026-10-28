import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Tweet from "./Tweet";
import { getFeed } from "../services/api";
import "../styles/Feed.css";

function Feed() {
  useOutletContext();

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
          content: tweet.content,
          likes: 0,
          createdAt: tweet.createdAt,
        }));

        setPosts(formattedPosts);
        setTotalPages(data.totalPages);
      } catch (error) {
        setError(error.message);
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

        <p>Cargando publicaciones...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="feed">
        <header className="feed__header">
          <h1>Inicio</h1>
        </header>

        <p>{error}</p>
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

          <button
            className="feed__tab"
            type="button"
          >
            Siguiendo
          </button>
        </div>
      </header>

      {posts.length === 0 ? (
        <p>No hay publicaciones para mostrar.</p>
      ) : (
        posts.map((post) => (
          <Tweet
            key={post.id}
            post={post}
          />
        ))
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