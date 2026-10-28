
import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { followUser, unfollowUser } from "../services/api";
import "../styles/Profile.css";

function Following() {
  const { username } = useParams();
  const { followingUsernames, setFollowingUsernames } =
    useOutletContext();

  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingUser, setProcessingUser] = useState(null);

  const usersPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(users.length / usersPerPage));

  const visibleUsers = users.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  useEffect(() => {
    let cancelled = false;

    async function loadFollowing() {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Debes iniciar sesión para ver esta lista.");
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/follows/${encodeURIComponent(username)}/following`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "No se pudo cargar la lista de seguidos.");
        }

        if (!cancelled) {
          const sortedUsers = (data.items || []).sort((a, b) =>
            a.fullName.localeCompare(b.fullName, "es")
          );

          setUsers(sortedUsers);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Ocurrió un error al cargar los seguidos.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFollowing();

    return () => {
      cancelled = true;
    };
  }, [username]);

  async function handleFollow(targetUsername) {
    if (processingUser) return;

    const isFollowing = followingUsernames.includes(targetUsername);

    setProcessingUser(targetUsername);
    setError("");

    try {
      if (isFollowing) {
        await unfollowUser(targetUsername);
        setFollowingUsernames((current) =>
          current.filter((item) => item !== targetUsername)
        );

        setUsers((current) =>
          current.filter((user) => user.username !== targetUsername)
        );
      } else {
        await followUser(targetUsername);
        setFollowingUsernames((current) =>
          current.includes(targetUsername)
            ? current
            : [...current, targetUsername]
        );
      }
    } catch (err) {
      setError(err.message || "No se pudo actualizar el seguimiento.");
    } finally {
      setProcessingUser(null);
    }
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [username]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(users.length / usersPerPage));

    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [currentPage, users.length]);

  return (
    <main className="follow-list-page">
      <header className="follow-list-header">
        <Link to={`/users/${username}`} className="follow-list-back">
          ← Volver
        </Link>

        <div className="follow-list-heading">
          <h1>Siguiendo</h1>
          <p>@{username}</p>
        </div>

        <p className="follow-list-count">
          {loading ? "Cargando..." : `${users.length} siguiendo`}
        </p>
      </header>

      {error && <p role="alert">{error}</p>}

      <section className="follow-list">
        {loading ? (
          <p>Cargando usuarios...</p>
        ) : users.length > 0 ? (
          visibleUsers.map((user) => {
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

              <h2>Este usuario aún no sigue a nadie</h2>
              <p>
                Cuando empiece a seguir a otras personas, sus perfiles
                aparecerán aquí.
              </p>

              <Link to="/" className="follow-list-discover">
                Explorar publicaciones
              </Link>
            </div>
          )
        )}
      </section>

      <footer className="follow-list-footer">
        {totalPages > 1 ? (
          <nav className="pagination" aria-label="Paginación de usuarios">
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
        ) : (
          <p>Página {currentPage} de {totalPages}</p>
        )}
      </footer>
    </main>
  );
}

export default Following;
