
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getFollowing,
} from "../services/api";
import "../styles/Profile.css";
import { useAuth } from "../context/AuthContext";
import useFollow from "../hooks/useFollow";

const UNFOLLOW_DELAY = 5;

function normalizeUsername(username) {
  return (username || "").toLowerCase();
}

function Following() {
  const { username } = useParams();

  const [myFollowingUsernames, setMyFollowingUsernames] = useState([]);
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingUnfollow, setPendingUnfollow] = useState(null);
  const [unfollowSeconds, setUnfollowSeconds] = useState(
    UNFOLLOW_DELAY
  );

  const loggedInUser = useAuth().user;
  const { processingUser, follow, unfollow } = useFollow();

  const currentUsername = loggedInUser?.username || "";

  const isOwnList =
    normalizeUsername(username) ===
    normalizeUsername(currentUsername);

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

    async function loadFollowing() {
      setLoading(true);
      setError("");

      try {
        if (!currentUsername) {
          throw new Error(
            "No se pudo identificar tu sesión. Cierra sesión e inicia nuevamente."
          );
        }

        const profileFollowing = await getFollowing(
          username,
          currentPage,
          usersPerPage
        );

        if (cancelled) return;

        const profileItems = profileFollowing.items || [];
        const myFollowingUsernames = isOwnList
          ? profileItems.map((user) => user.username)
          : (
              await Promise.all(
                profileItems.map(async (user) =>
                  user.isFollowing
                    ? user.username
                    : null
                )
              )
            ).filter(Boolean);

        if (cancelled) return;

        setListData({
          username,
          page: currentPage,
          items: profileItems,
          totalItems: profileFollowing.totalItems || 0,
          totalPages: profileFollowing.totalPages || 0,
        });
        setMyFollowingUsernames(myFollowingUsernames);

        const lastPage = Math.max(1, profileFollowing.totalPages || 0);
        if (currentPage > lastPage) setCurrentPage(lastPage);
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
  }, [
    username,
    currentUsername,
    isOwnList,
    currentPage,
    refreshKey,
    setCurrentPage,
  ]);

  // Delay the unfollow request to allow the user to undo it.
  useEffect(() => {
    if (!pendingUnfollow) return undefined;

    const countdownInterval = setInterval(() => {
      setUnfollowSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    const unfollowTimeout = setTimeout(async () => {
      setError("");

      try {
        const result = await unfollow(pendingUnfollow);
        if (result === false) return;

        setMyFollowingUsernames((current) =>
          current.filter(
            (item) =>
              normalizeUsername(item) !==
              normalizeUsername(pendingUnfollow)
          )
        );

        // Remove the user only after the backend confirms the action.
        setRefreshKey((current) => current + 1);
      } catch (err) {
        setError(
          err.message ||
            "No se pudo dejar de seguir al usuario. Inténtalo nuevamente."
        );
      } finally {
        setPendingUnfollow(null);
      }
    }, UNFOLLOW_DELAY * 1000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(unfollowTimeout);
    };
  }, [pendingUnfollow, unfollow]);

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

    try {
      const result = await follow(targetUsername);
      if (result === false) return;

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
          {isLoading ? "Cargando..." : `${totalItems} siguiendo`}
        </p>
      </header>

      {error && <p role="alert">{error}</p>}

      <section className="follow-list">
        {isLoading ? (
          <p>Cargando usuarios...</p>
        ) : users.length > 0 ? (
          users.map((user) => {
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
        {displayTotalPages > 1 ? (
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
              Página {currentPage} de {displayTotalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(displayTotalPages, page + 1)
                )
              }
              disabled={currentPage === displayTotalPages}
            >
              Siguiente
            </button>
          </nav>
        ) : (
          <p>
            Página {currentPage} de {displayTotalPages}
          </p>
        )}
      </footer>
    </main>
  );
}

export default Following;
