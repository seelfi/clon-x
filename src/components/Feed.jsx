
import { useEffect, useState } from "react";
import Tweet from "./Tweet";
import { getFeed } from "../services/api";
import "../styles/Feed.css";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("forYou");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const postsPerPage = 10;

  useEffect(() => {
    let cancelled = false;

    async function loadFeed() {
      setLoading(true);
      setError("");

      try {
        const data = await getFeed(
          currentPage,
          postsPerPage,
          activeTab
        );

        const formattedPosts = data.items.map((tweet) => ({
          id: tweet.id,
          author: tweet.author.username,
          authorName: tweet.author.fullName,
          authorUsername: tweet.author.username,
          content: tweet.content,
          createdAt: tweet.createdAt,
          likesCount: tweet.likesCount,
          retweetsCount: tweet.retweetsCount,
          commentsCount: tweet.commentsCount,
          likedByMe: tweet.likedByMe,
          retweetedByMe: tweet.retweetedByMe,
        }));

        if (!cancelled) {
          setPosts(formattedPosts);
          setTotalPages(Math.max(1, data.totalPages));
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error.message || "No fue posible cargar las publicaciones."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFeed();

    return () => {
      cancelled = true;
    };
  }, [currentPage, activeTab, retryCount]);

  function handleTabChange(tab) {
    if (tab === activeTab) return;

    setCurrentPage(1);
    setActiveTab(tab);
  }

  function handlePreviousPage() {
    setCurrentPage((page) => Math.max(1, page - 1));
  }

  function handleNextPage() {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  }

  return (
    <main className="feed">
      <header className="feed__header">
        <h1>Inicio</h1>

        <div className="feed__tabs">
          <button
            type="button"
            className={`feed__tab ${
              activeTab === "forYou" ? "feed__tab--active" : ""
            }`}
            onClick={() => handleTabChange("forYou")}
            aria-pressed={activeTab === "forYou"}
          >
            Para ti
          </button>

          <button
            type="button"
            className={`feed__tab ${
              activeTab === "following" ? "feed__tab--active" : ""
            }`}
            onClick={() => handleTabChange("following")}
            aria-pressed={activeTab === "following"}
          >
            Siguiendo
          </button>
        </div>
      </header>

      {loading ? (
        <div className="feed__status" role="status">
          <div className="feed__status-icon" aria-hidden="true">
            ↻
          </div>
          <h2>Cargando tu inicio</h2>
          <p>Estamos buscando las publicaciones para ti.</p>
        </div>
      ) : error ? (
        <div className="feed__status" role="alert">
          <div className="feed__status-icon" aria-hidden="true">
            !
          </div>
          <h2>No pudimos cargar el inicio</h2>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Volver a intentar
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="feed__status">
          <div className="feed__status-icon" aria-hidden="true">
            ✧
          </div>
          <h2>
            {activeTab === "forYou"
              ? "No hay publicaciones nuevas para ti"
              : "Aún no hay publicaciones de las personas que sigues"}
          </h2>
          <p>
            {activeTab === "forYou"
              ? "Vuelve más tarde para descubrir publicaciones de otras personas."
              : "Sigue a otros usuarios para ver sus publicaciones aquí."}
          </p>
        </div>
      ) : (
        posts.map((post) => <Tweet key={post.id} post={post} />)
      )}

      {!loading && !error && totalPages > 1 && (
        <nav className="pagination" aria-label="Paginación de publicaciones">
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
