
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { followUser, unfollowUser } from "../services/api";
import "../styles/Profile.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const UNFOLLOW_DELAY = 5;

function normalizeUsername(username) {
  return (username || "").toLowerCase();
}

function Following() {
  const { username } = useParams();

  const [users, setUsers] = useState([]);
  const [myFollowingUsernames, setMyFollowingUsernames] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingUser, setProcessingUser] = useState(null);
  const [pendingUnfollow, setPendingUnfollow] = useState(null);
  const [unfollowSeconds, setUnfollowSeconds] = useState(
    UNFOLLOW_DELAY
  );

  const loggedInUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const currentUsername = loggedInUser?.username || "";

  const isOwnList =
    normalizeUsername(username) ===
    normalizeUsername(currentUsername);

  const usersPerPage = 10;
  const totalPages = Math.max(
    1,
    Math.ceil(users.length / usersPerPage)
  );

  const visibleUsers = users.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchFollowing(targetUsername, token) {
      const response = await fetch(
        `${API_URL}/follows/${encodeURIComponent(targetUsername)}/following`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "No se pudo cargar la lista de seguidos."
        );
      }

      return data.items || [];
    }

    async function loadFollowing() {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Debes iniciar sesión para ver esta lista."
          );
        }

        if (!currentUsername) {
          throw new Error(
            "No se pudo identificar tu sesión. Cierra sesión e inicia nuevamente."
          );
        }

        const [profileFollowing, myFollowing] = await Promise.all([
          fetchFollowing(username, token),
          fetchFollowing(currentUsername, token),
        ]);

        if (cancelled) return;

        const sortedUsers = [...profileFollowing].sort((a, b) =>
          (a.fullName || "").localeCompare(
            b.fullName || "",
            "es"
          )
        );

        setUsers(sortedUsers);
        setMyFollowingUsernames(
          myFollowing.map((user) => user.username)
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Ocurrió un error al cargar los seguidos."
          );
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
  }, [username, currentUsername]);

  // Reset pagination when changing profiles.
  useEffect(() => {
    setCurrentPage(1);
  }, [username]);

  // Keep the current page within the available range.
  useEffect(() => {
    const maxPage = Math.max(
      1,
      Math.ceil(users.length / usersPerPage)
    );

    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [currentPage, users.length]);

  // Delay the unfollow request to allow the user to undo it.
  useEffect(() => {
    if (!pendingUnfollow) return undefined;

    setUnfollowSeconds(UNFOLLOW_DELAY);

    const countdownInterval = setInterval(() => {
      setUnfollowSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    const unfollowTimeout = setTimeout(async () => {
      setProcessingUser(pendingUnfollow);
      setError("");

      try {
        await unfollowUser(pendingUnfollow);

        setMyFollowingUsernames((current) =>
          current.filter(
            (item) =>
              normalizeUsername(item) !==
              normalizeUsername(pendingUnfollow)
          )
        );

        // Remove the user only after the backend confirms the action.
        if (isOwnList) {
          setUsers((current) =>
            current.filter(
              (user) =>
                normalizeUsername(user.username) !==
                normalizeUsername(pendingUnfollow)
            )
          );
        }
      } catch (err) {
        setError(
          err.message ||
            "No se pudo dejar de seguir al usuario. Inténtalo nuevamente."
        );
      } finally {
        setProcessingUser(null);
        setPendingUnfollow(null);
      }
    }, UNFOLLOW_DELAY * 1000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(unfollowTimeout);
    };
  }, [pendingUnfollow, isOwnList]);

  async function handleFollow(targetUsername) {
    if (processingUser || pendingUnfollow) return;

    const alreadyFollowing = myFollowingUsernames.some(
      (item) =>
        normalizeUsername(item) ===
        normalizeUsername(targetUsername)
    );

    setError("");

    if (alreadyFollowing) {
      // Keep the database relationship until the countdown finishes.
      setPendingUnfollow(targetUsername);
      setUnfollowSeconds(UNFOLLOW_DELAY);
      return;
    }

    setProcessingUser(targetUsername);

    try {
      await followUser(targetUsername);

      setMyFollowingUsernames((current) =>
        current.some(
          (item) =>
            normalizeUsername(item) ===
            normalizeUsername(targetUsername)
        )
          ? current
          : [...current, targetUsername]
      );
    } catch (err) {
      setError(
        err.message || "No se pudo seguir al usuario."
      );
    } finally {
      setProcessingUser(null);
    }
  }

  function handleUndoUnfollow() {
    // Clearing this state cancels the timeout before the API request.
    setPendingUnfollow(null);
    setUnfollowSeconds(UNFOLLOW_DELAY);
    setError("");
  }

  return (
    <main className="follow-list-page">
      <header className="follow-list-header">
        <Link
          to={`/users/${encodeURIComponent(username)}`}
          className="follow-list-back"
        >
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
            const isFollowing = myFollowingUsernames.some(
              (item) =>
                normalizeUsername(item) ===
                normalizeUsername(user.username)
            );

            const isCurrentUser =
              normalizeUsername(user.username) ===
              normalizeUsername(currentUsername);

            const isPending =
              normalizeUsername(pendingUnfollow) ===
              normalizeUsername(user.username);

            return (
              <article
                className="follow-list-item"
                key={user.id}
              >
                <div
                  className="follow-list-avatar"
                  aria-hidden="true"
                >
                  {(user.fullName || user.username)
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="follow-list-info">
                  <h3>{user.fullName}</h3>
                  <p>@{user.username}</p>
                </div>

                <div className="follow-list-actions">
                  <Link
                    to={`/users/${encodeURIComponent(user.username)}`}
                    className="follow-list-profile-link"
                  >
                    Ver perfil
                  </Link>

                  {!isCurrentUser && (
                    <button
                      type="button"
                      className={`follow-list-action ${
                        isFollowing
                          ? "follow-list-action--following"
                          : ""
                      }`}
                      onClick={() =>
                        isPending
                          ? handleUndoUnfollow()
                          : handleFollow(user.username)
                      }
                      disabled={
                        Boolean(processingUser) ||
                        (Boolean(pendingUnfollow) && !isPending)
                      }
                    >
                      {processingUser === user.username
                        ? "Procesando..."
                        : isPending
                          ? `Deshacer (${unfollowSeconds})`
                          : isFollowing
                            ? "Dejar de seguir"
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
              <div
                className="follow-list-empty-icon"
                aria-hidden="true"
              >
                ♧
              </div>

              <h2>Este usuario aún no sigue a nadie</h2>
              <p>
                Cuando empiece a seguir a otras personas, sus perfiles
                aparecerán aquí.
              </p>

              <Link
                to="/"
                className="follow-list-discover"
              >
                Explorar publicaciones
              </Link>
            </div>
          )
        )}
      </section>

      <footer className="follow-list-footer">
        {totalPages > 1 ? (
          <nav
            className="pagination"
            aria-label="Paginación de usuarios"
          >
            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(1, page - 1)
                )
              }
              disabled={currentPage === 1}
            >
              Anterior
            </button>

            <span>
              Página {currentPage} de {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(totalPages, page + 1)
                )
              }
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </nav>
        ) : (
          <p>
            Página {currentPage} de {totalPages}
          </p>
        )}
      </footer>
    </main>
  );
}

export default Following;
