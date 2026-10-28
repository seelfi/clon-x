import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getUserProfile,
  followUser,
  unfollowUser,
  updateBio,
} from "../services/api";
import Tweet from "../components/Tweet";
import "../styles/Profile.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function Profile() {
  const { username } = useParams();

  const [user, setUser] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

      try {
        const [profileData, tweetsResponse] = await Promise.all([
          getUserProfile(username),
          fetch(
            `${API_URL}/users/${encodeURIComponent(username)}/tweets?page=1&size=10`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          ),
        ]);

        const tweetsData = await tweetsResponse.json();

        if (!tweetsResponse.ok) {
          throw new Error(tweetsData.message || "Error loading user posts");
        }

        let followingStatus = false;
        const storedUser = localStorage.getItem("user");
        const currentUser = storedUser ? JSON.parse(storedUser) : null;

        if (currentUser?.username !== profileData.username) {
          const statusResponse = await fetch(
            `${API_URL}/follows/${encodeURIComponent(username)}/status`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );

          const statusData = await statusResponse.json();

          if (!statusResponse.ok) {
            throw new Error(
              statusData.message || "Error checking follow status",
            );
          }

          followingStatus = statusData.isFollowing;
        }

        if (!cancelled) {
          setUser(profileData);
          setTweets(tweetsData.items);
          setIsFollowing(followingStatus);
          setBioDraft(profileData.bio || "");
        }
      } catch (error) {
        if (!cancelled) {
          setError(error.message);
          setUser(null);
          setTweets([]);
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
  }, [username]);

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
          followersCount: Math.max(0, Number(currentUser.followersCount) - 1),
        }));
      } else {
        await followUser(user.username);
        setIsFollowing(true);

        setUser((currentUser) => ({
          ...currentUser,
          followersCount: Number(currentUser.followersCount) + 1,
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

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const isOwnProfile = currentUser?.username === user.username;

  return (
    <main className="profile-page">
      <header className="profile-header">
        <Link to="/" className="profile-back-link">
          ← Volver al inicio
        </Link>

        <div className="profile-header-title">
          <h1>{user.fullName}</h1>
          <p>
            {tweets.length}{" "}
            {tweets.length === 1 ? "publicación" : "publicaciones"}
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
          <form className="profile-bio-form" onSubmit={handleSaveBio}>
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

            {bioError && <p className="profile-error">{bioError}</p>}

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

        {followError && <p className="profile-error">{followError}</p>}

        <div className="profile-stats">
          <Link to={`/users/${encodeURIComponent(user.username)}/following`}>
            <strong>{user.followingCount}</strong>
            <span>Siguiendo</span>
          </Link>

          <Link to={`/users/${encodeURIComponent(user.username)}/followers`}>
            <strong>{user.followersCount}</strong>
            <span>Seguidores</span>
          </Link>
        </div>
      </section>

      <nav className="profile-tabs" aria-label="Publicaciones del perfil">
        <div className="profile-tab active">Publicaciones</div>
      </nav>

      <section className="profile-tweets">
        {tweets.length > 0 ? (
          tweets.map((tweet) => (
            <Tweet
              key={tweet.id}
              post={{
                id: tweet.id,
                author: tweet.author.username,
                authorName: tweet.author.fullName,
                authorUsername: tweet.author.username,
                content: tweet.content,
                likes: 0,
                createdAt: tweet.createdAt,
              }}
            />
          ))
        ) : (
          <p className="empty-state">
            Este usuario todavía no tiene publicaciones.
          </p>
        )}
      </section>
    </main>
  );
}

export default Profile;
