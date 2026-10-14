import { useOutletContext, useParams, Link } from "react-router-dom";
import Tweet from "../components/Tweet";
import "../styles/Profile.css";

function Profile() {
  const { username } = useParams();
  const { posts } = useOutletContext();

  const user = {
    fullName: "Pablo Alvarez",
    username: "pablo_dev",
    followers: 120,
    following: 85,
    bio: "Desarrollador en formación 💻",
  };

  const userTweets = posts
  .filter((post) => post.author === username)
  .sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  )

  return (
    <main className="profile-page">
      <header className="profile-header">
        <Link to="/">← Volver al inicio</Link>
        <h1>{user.fullName}</h1>
        <p>Perfil de usuario</p>
      </header>

      <section className="profile-info">
        <div className="profile-avatar">{user.fullName.charAt(0)}</div>

        <h2>{user.fullName}</h2>
        <p>@{user.username}</p>
        <p>{user.bio}</p>

        <div className="profile-stats">
          <Link to={`/users/${username}/following`}>
            <strong>{user.following}</strong> Siguiendo
          </Link>

          <Link to={`/users/${username}/followers`}>
            <strong>{user.followers}</strong> Seguidores
          </Link>
        </div>

        {username !== "pablo_dev" && <button type="button">Seguir</button>}
      </section>

      <section className="profile-tweets">
        <h2>Publicaciones</h2>

        {userTweets.length > 0 ? (
          userTweets.map((post) => <Tweet key={post.id} post={post} />)
        ) : (
          <p>Este usuario todavía no tiene publicaciones.</p>
        )}
      </section>
    </main>
  );
}

export default Profile;
