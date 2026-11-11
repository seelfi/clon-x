
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  getUserProfile,
  getUserTweets,
  getUserRetweets,
  followUser,
  unfollowUser,
  updateBio,
} from "../services/api";

import Tweet from "../components/Tweet";
import "../styles/Profile.css";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user: currentUser } = useAuth();
  const { username } = useParams();

  const [user, setUser] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [retweets, setRetweets] = useState([]);
  const [tweetsPage, setTweetsPage] = useState(1);
  const [retweetsPage, setRetweetsPage] = useState(1);
  const [tweetsPagination, setTweetsPagination] = useState({ page: 1, size: 10, totalItems: 0, totalPages: 0 });
  const [retweetsPagination, setRetweetsPagination] = useState({ page: 1, size: 10, totalItems: 0, totalPages: 0 });
  const [profileUsername, setProfileUsername] = useState(null);

  const [activeTab, setActiveTab] = useState("posts");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState("");

  const [isFollowing, setIsFollowing] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [followError, setFollowError] = useState("");

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [bioLoading, setBioLoading] = useState(false);
  const [bioError, setBioError] = useState("");
  const [bioSuccess, setBioSuccess] = useState("");

  useEffect(() => {
    if (!bioSuccess) return;

    const timeoutId = setTimeout(() => {
      setBioSuccess("");
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [bioSuccess]);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError("");
      setFollowError("");
      setBioError("");
      setBioSuccess("");
      setIsEditingBio(false);
      setActiveTab("posts");
      setUser(null);
      setProfileUsername(null);
      setTweetsPage(1);
      setRetweetsPage(1);
      setTweets([]);
      setRetweets([]);
      setTweetsPagination({ page: 1, size: 10, totalItems: 0, totalPages: 0 });
      setRetweetsPagination({ page: 1, size: 10, totalItems: 0, totalPages: 0 });

      try {
        const profileData = await getUserProfile(username);

        if (!cancelled) {
          setUser(profileData);
          setProfileUsername(username);
          setIsFollowing(Boolean(profileData.isFollowing));
          setBioDraft(profileData.bio || "");
        }
      } catch (error) {
        if (!cancelled) {
          setError(error.message || "Error loading profile");
          setUser(null);
          setTweets([]);
          setRetweets([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [username, currentUser?.username]);

  useEffect(() => {
    if (profileUsername !== username) return undefined;

    let cancelled = false;
    const page = activeTab === "posts" ? tweetsPage : retweetsPage;

    async function loadPage() {
      setItemsLoading(true);
      setItemsError("");

      try {
        const data = activeTab === "posts"
          ? await getUserTweets(username, page, 10)
          : await getUserRetweets(username, page, 10);

        if (cancelled) return;

        const pagination = {
          page: data.page ?? page,
          size: data.size ?? 10,
          totalItems: data.totalItems ?? 0,
          totalPages: data.totalPages ?? 0,
        };

        if (activeTab === "posts") {
          setTweets(data.items || []);
          setTweetsPagination(pagination);
          if (page > Math.max(1, data.totalPages)) {
            setTweetsPage(Math.max(1, data.totalPages));
          }
        } else {
          setRetweets(data.items || []);
          setRetweetsPagination(pagination);
          if (page > Math.max(1, data.totalPages)) {
            setRetweetsPage(Math.max(1, data.totalPages));
          }
        }
      } catch (pageError) {
        if (!cancelled) {
          setItemsError(pageError.message || "No se pudieron cargar las publicaciones.");
          if (activeTab === "posts") setTweets([]);
          else setRetweets([]);
        }
      } finally {
        if (!cancelled) setItemsLoading(false);
      }
    }

    loadPage();
    return () => {
      cancelled = true;
    };
  }, [username, profileUsername, activeTab, tweetsPage, retweetsPage]);

  async function handleFollowToggle() {
    if (!user || followingLoading) return;

    setFollowingLoading(true);
    setFollowError("");

    try {
      if (isFollowing) {
        await unfollowUser(user.username);
        setIsFollowing(false);

        setUser((currentUser) => ({
          ...currentUser,
          followersCount: Math.max(
            0,
            Number(currentUser.followersCount) - 1
          ),
        }));
      } else {
        await followUser(user.username);
        setIsFollowing(true);

        setUser((currentUser) => ({
          ...currentUser,
          followersCount:
            Number(currentUser.followersCount) + 1,
        }));
      }
    } catch (error) {
      setFollowError(error.message);
    } finally {
      setFollowingLoading(false);
    }
  }

  async function handleSaveBio(event) {
    event.preventDefault();

    if (bioLoading) return;

    setBioLoading(true);
    setBioError("");
    setBioSuccess("");

    try {
      const result = await updateBio(bioDraft);

      setUser((currentUser) => ({
        ...currentUser,
        bio: result.bio,
      }));

      setBioDraft(result.bio);
      setIsEditingBio(false);
      setBioSuccess("Biografía actualizada correctamente.");
    } catch (error) {
      setBioError(error.message);
    } finally {
      setBioLoading(false);
    }
  }

  function handleCancelBio() {
    setBioDraft(user?.bio || "");
    setBioError("");
    setIsEditingBio(false);
  }

  if (loading) {
    return (
      <main className="profile-page">
        <p className="profile-message">Cargando perfil...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="profile-page">
        <header className="profile-header">
          <Link to="/">← Volver al inicio</Link>
          <h1>No se pudo cargar el perfil</h1>
          <p>{error}</p>
        </header>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="profile-page">
        <header className="profile-header">
          <h1>Usuario no encontrado</h1>
          <p>No existe un perfil para @{username}.</p>
          <Link to="/">Volver al inicio</Link>
        </header>
      </main>
    );
  }

  const isOwnProfile = currentUser?.username === user.username;

  const activePage = activeTab === "posts" ? tweetsPage : retweetsPage;
  const activePagination = activeTab === "posts" ? tweetsPagination : retweetsPagination;
  const pageItems = activeTab === "posts" ? tweets : retweets;
  const displayedItems = activePagination.page === activePage ? pageItems : [];
  const displayTotalPages = Math.max(1, activePagination.totalPages || 0);
  const displayedCount = Number(
    (activeTab === "posts" ? user.tweetsCount : user.retweetsCount) ??
      displayedItems.length
  );

  return (
    <main className="profile-page">
      <header className="profile-header">
        <Link to="/" className="profile-back-link">
          ← Volver al inicio
        </Link>

        <div className="profile-header-title">
          <h1>{user.fullName}</h1>
          <p>
            {displayedCount}{" "}
            {activeTab === "posts"
              ? displayedCount === 1
                ? "publicación"
                : "publicaciones"
              : displayedCount === 1
                ? "republicación"
                : "republicaciones"}
          </p>
        </div>
      </header>

      <section className="profile-info">
        <div className="profile-cover" />

        <div className="profile-actions">
          <div className="profile-avatar">
            {user.fullName.charAt(0).toUpperCase()}
          </div>

          {!isOwnProfile && (
            <button
              type="button"
              className={`profile-follow-button ${
                isFollowing ? "is-following" : ""
              }`}
              onClick={handleFollowToggle}
              disabled={followingLoading}
            >
              {followingLoading
                ? "Procesando..."
                : isFollowing
                  ? "Siguiendo"
                  : "Seguir"}
            </button>
          )}

          {isOwnProfile && !isEditingBio && (
            <button
              type="button"
              className="profile-edit-button"
              onClick={() => {
                setBioDraft(user.bio || "");
                setBioError("");
                setBioSuccess("");
                setIsEditingBio(true);
              }}
            >
              Editar perfil
            </button>
          )}
        </div>

        <div className="profile-identity">
          <h2>{user.fullName}</h2>
          <p className="profile-username">@{user.username}</p>
        </div>

        {isEditingBio ? (
          <form
            className="profile-bio-form"
            onSubmit={handleSaveBio}
          >
            <label htmlFor="profileBio">Biografía</label>

            <textarea
              id="profileBio"
              value={bioDraft}
              onChange={(event) =>
                setBioDraft(event.target.value.slice(0, 160))
              }
              maxLength={160}
              rows={4}
              placeholder="Cuéntale al mundo algo sobre ti"
            />

            <p className="profile-bio-counter">
              {bioDraft.length}/160 caracteres
            </p>

            {bioError && (
              <p className="profile-error">{bioError}</p>
            )}

            <div className="profile-bio-actions">
              <button type="submit" disabled={bioLoading}>
                {bioLoading ? "Guardando..." : "Guardar"}
              </button>

              <button
                type="button"
                onClick={handleCancelBio}
                disabled={bioLoading}
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="profile-bio">
              {user.bio || "Aún no has agregado una biografía."}
            </p>

            {bioSuccess && (
              <p className="profile-success" role="status">
                {bioSuccess}
              </p>
            )}
          </>
        )}

        {followError && (
          <p className="profile-error">{followError}</p>
        )}

        <div className="profile-stats">
          <Link
            to={`/users/${encodeURIComponent(user.username)}/following`}
          >
            <strong>{user.followingCount}</strong>
            <span>Siguiendo</span>
          </Link>

          <Link
            to={`/users/${encodeURIComponent(user.username)}/followers`}
          >
            <strong>{user.followersCount}</strong>
            <span>Seguidores</span>
          </Link>
        </div>
      </section>

      <nav
        className="profile-tabs"
        aria-label="Publicaciones del perfil"
      >
        <button
          type="button"
          className={`profile-tab ${
            activeTab === "posts" ? "active" : ""
          }`}
          onClick={() => setActiveTab("posts")}
        >
          Publicaciones
        </button>

        <button
          type="button"
          className={`profile-tab ${
            activeTab === "retweets" ? "active" : ""
          }`}
          onClick={() => setActiveTab("retweets")}
        >
          Republicaciones
        </button>
      </nav>

      <section className="profile-tweets">
        {itemsLoading ? (
          <p className="profile-message">Cargando publicaciones...</p>
        ) : itemsError ? (
          <p className="profile-error" role="alert">{itemsError}</p>
        ) : displayedItems.length > 0 ? (
          displayedItems.map((tweet) => (
            <Tweet
              key={tweet.id}
              post={{
                ...tweet,
                authorName: tweet.author.fullName,
                authorUsername: tweet.author.username,
                retweetedBy:
                  activeTab === "retweets"
                    ? user.username
                    : undefined,
              }}
            />
          ))
        ) : (
          <p className="empty-state">
            {activeTab === "posts"
              ? "Este usuario todavía no tiene publicaciones."
              : "Este usuario todavía no tiene republicaciones."}
          </p>
        )}
        <nav className="pagination" aria-label="Paginación de publicaciones">
          <button
            type="button"
            onClick={() => activeTab === "posts"
              ? setTweetsPage((page) => Math.max(1, page - 1))
              : setRetweetsPage((page) => Math.max(1, page - 1))}
            disabled={itemsLoading || activePage <= 1}
          >
            Anterior
          </button>
          <span>Página {activePage} de {displayTotalPages}</span>
          <button
            type="button"
            onClick={() => activeTab === "posts"
              ? setTweetsPage((page) => Math.min(displayTotalPages, page + 1))
              : setRetweetsPage((page) => Math.min(displayTotalPages, page + 1))}
            disabled={itemsLoading || activePage >= displayTotalPages}
          >
            Siguiente
          </button>
        </nav>
      </section>
    </main>
  );
}

export default Profile;
