
import '../styles/Profile.css'

function Following() {
  const users = [
    { id: 1, fullName: 'Ana Gómez', username: 'ana_dev' },
    { id: 2, fullName: 'Carlos Pérez', username: 'carlos_code' },
    { id: 3, fullName: 'Laura Restrepo', username: 'laura_design' },
    { id: 4, fullName: 'Mateo Ruiz', username: 'mateo_tech' },
    { id: 5, fullName: 'Sofía Torres', username: 'sofia_web' }
  ]

  const sortedUsers = [...users].sort((a, b) =>
    a.fullName.localeCompare(b.fullName, 'es')
  )

  
return (
  <main className="profile-page">
    <header className="profile-header">
      <a href="/users/pablo_dev">← Volver al perfil</a>
      <h1>Siguiendo</h1>
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

          <button type="button">Ver perfil</button>
        </article>
      ))}
    </section>

    <footer className="profile-header">
      <p>Página 1 de 1</p>
    </footer>
  </main>
)

}

export default Following
