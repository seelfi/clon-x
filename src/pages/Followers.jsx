
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getFollowers } from "../services/api";
import "../styles/Profile.css";
import useFollow from "../hooks/useFollow";

function Followers() {
  const { username } = useParams();

  const [followingUsernames, setFollowingUsernames] = useState([]);
  const [pageSelection, setPageSelection] = useState({
    username: null,
    page: 1,
  });
  const [listData, setListData] = useState({
    username: null,
    page: 0,
    items: [],
    totalItems: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { processingUser, follow, unfollow } = useFollow();

  const currentPage =
    pageSelection.username === username ? pageSelection.page : 1;

  const setCurrentPage = useCallback(
    (nextPage) => {
      setPageSelection((current) => {
        const page = current.username === username ? current.page : 1;

        return {
          username,
          page:
            typeof nextPage === "function" ? nextPage(page) : nextPage,
        };
      });
    },
    [username]
  );

  const hasCurrentPage =
    listData.username === username && listData.page === currentPage;
  const isCurrentProfile = listData.username === username;
  const users = hasCurrentPage ? listData.items : [];
  const totalItems = isCurrentProfile ? listData.totalItems : 0;
  const totalPages = isCurrentProfile ? listData.totalPages : 0;
  const isLoading = loading || (!error && !hasCurrentPage);

  const usersPerPage = 10;
  const displayTotalPages = Math.max(1, totalPages);

  useEffect(() => {
    let cancelled = false;

    async function loadFollowers() {
      setLoading(true);
      setError("");

      try {
        const data = await getFollowers(username, currentPage, usersPerPage);

        const items = data.items || [];
        const followedUsernames = await Promise.all(
          items.map(async (user) => {
            return user.isFollowing ? user.username : null;
          })
        );

        if (!cancelled) {
          setListData({
            username,
            page: currentPage,
            items,
            totalItems: data.totalItems || 0,
            totalPages: data.totalPages || 0,
          });
          setFollowingUsernames(followedUsernames.filter(Boolean));

          const lastPage = Math.max(1, data.totalPages || 0);
          if (currentPage > lastPage) setCurrentPage(lastPage);
        }
      } catch (err) {
        if (!cancelled) {
          setListData({
            username: null,
            page: 0,
            items: [],
            totalItems: 0,
            totalPages: 0,
          });
          setFollowingUsernames([]);
          setError(err.message || "Ocurrió un error al cargar los seguidores.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFollowers();

    return () => {
      cancelled = true;
    };
  }, [username, currentPage, setCurrentPage]);

  async function handleFollow(targetUsername) {
    if (processingUser) return;

    const isFollowing = followingUsernames.includes(targetUsername);

    setError("");

    try {
      if (isFollowing) {
        const result = await unfollow(targetUsername);
        if (result === false) return;
        setFollowingUsernames((current) =>
          current.filter((item) => item !== targetUsername)
        );
      } else {
        const result = await follow(targetUsername);
        if (result === false) return;
        setFollowingUsernames((current) =>
          current.includes(targetUsername)
            ? current
            : [...current, targetUsername]
        );
      }
    } catch (err) {
      setError(err.message || "No se pudo actualizar el seguimiento.");
    }
  }

  return (
    <main className="follow-list-page">
      <header className="follow-list-header">
        <Link to={`/users/${username}`} className="follow-list-back">
          ← Volver
        </Link>

        <div className="follow-list-heading">
          <h1>Seguidores</h1>
          <p>@{username}</p>
        </div>

        <p className="follow-list-count">
          {isLoading ? "Cargando..." : `${totalItems} seguidores`}
        </p>
      </header>

      {error && <p role="alert">{error}</p>}

      <section className="follow-list">
        {isLoading ? (
          <p>Cargando seguidores...</p>
        ) : users.length > 0 ? (
          users.map((user) => {
            const isFollowing = followingUsernames.includes(user.username);

            return (
              <article className="follow-list-item" key={user.id}>
                <div className="follow-list-avatar" aria-hidden="true">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>

                <div className="follow-list-info">
                  <h3>{user.fullName}</h3>
                  <p>@{user.username}</p>
                </div>

                <div className="follow-list-actions">
                  <Link
                    to={`/users/${user.username}`}
                    className="follow-list-profile-link"
                  >
                    Ver perfil
                  </Link>

                  {user.username !== username && (
                    <button
                      type="button"
                      className={`follow-list-action ${
                        isFollowing ? "follow-list-action--following" : ""
                      }`}
                      onClick={() => handleFollow(user.username)}
                      disabled={processingUser === user.username}
                    >
                      {processingUser === user.username
                        ? "Procesando..."
                        : isFollowing
                          ? "Siguiendo"
                          : "Seguir"}
                    </button>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          !error && (
            <div className="follow-list-empty">
              <div className="follow-list-empty-icon" aria-hidden="true">
                ♧
              </div>

              <h2>Aún no tiene seguidores</h2>
              <p>
                Cuando otras personas sigan a este usuario, aparecerán aquí.
              </p>
            </div>
          )
        )}
      </section>

      <footer className="follow-list-footer">
        {displayTotalPages > 1 ? (
          <nav className="pagination" aria-label="Paginación de usuarios">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => page - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </button>

            <span>
              Página {currentPage} de {displayTotalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(displayTotalPages, page + 1))
              }
              disabled={currentPage === displayTotalPages}
            >
              Siguiente
            </button>
          </nav>
        ) : (
          <p>Página {currentPage} de {displayTotalPages}</p>
        )}
      </footer>
    </main>
  );
}

export default Followers;
