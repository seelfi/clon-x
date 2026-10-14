import '../styles/Profile.css'

function Profile() {
  const user = {
    fullName: 'Pablo Alvarez',
    username: 'pablo_dev',
    followers: 120,
    following: 85,
    bio: 'Desarrollador en formación 💻'
  }

  const tweets = [
    {
      id: 1,
      content: '¡Construyendo mi propio clon de X con React!',
      createdAt: '14 oct. 2026'
    },
    {
      id: 2,
      content: 'Aprendiendo algo nuevo cada día 🚀',
      createdAt: '13 oct. 2026'
    }
  ]

  return (
    <main className="profile-page">
      <header className="profile-header">
        <a href="/">← Volver al inicio</a>
        <h1>{user.fullName}</h1>
        <p>Perfil de usuario</p>
      </header>

      <section className="profile-info">
        <div className="profile-avatar">
          {user.fullName.charAt(0)}
        </div>

        <h2>{user.fullName}</h2>
        <p>@{user.username}</p>
        <p>{user.bio}</p>

        <div className="profile-stats">
          <span>
            <strong>{user.following}</strong> Siguiendo
          </span>
          <span>
            <strong>{user.followers}</strong> Seguidores
          </span>
        </div>

        <button type="button">Seguir</button>
      </section>

      <section className="profile-tweets">
        <h2>Publicaciones</h2>

        {tweets.map((tweet) => (
          <article className="profile-tweet" key={tweet.id}>
            <p>{user.fullName} <span>@{user.username}</span></p>
            <p>{tweet.content}</p>
            <small>{tweet.createdAt}</small>
          </article>
        ))}
      </section>
    </main>
  )
}

export default Profile
