
import '../styles/Profile.css'

function Followers() {
  const users = [
    { id: 1, fullName: 'Andrés López', username: 'andres_dev', isFollowing: false },
    { id: 2, fullName: 'Camila Ríos', username: 'camila_codes', isFollowing: true },
    { id: 3, fullName: 'Daniel Mesa', username: 'daniel_tech', isFollowing: false },
    { id: 4, fullName: 'Laura Restrepo', username: 'laura_design', isFollowing: true },
    { id: 5, fullName: 'Sofía Torres', username: 'sofia_web', isFollowing: false }
  ]

  const sortedUsers = [...users].sort((a, b) =>
    a.fullName.localeCompare(b.fullName, 'es')
  )

  return (
    <main className="profile-page">
      <header className="profile-header">
        <a href="/users/pablo_dev">← Volver al perfil</a>
        <h1>Seguidores</h1>
        <p>@pablo_dev</p>
      </header>

      <section className="user-list">
        {sortedUsers.map((user) => (
          <article className="user-list-item" key={user.id}>
            <div className="user-list-avatar">
              {user.fullName.charAt(0)}
            </div>

            <div className="user-list-info">
              <h3>{user.fullName}</h3>
              <p>@{user.username}</p>
            </div>

            <button type="button">
              {user.isFollowing ? 'Siguiendo' : 'Seguir'}
            </button>
          </article>
        ))}
      </section>

      <footer className="profile-header">
        <p>Página 1 de 1</p>
      </footer>
    </main>
  )
}

export default Followers
