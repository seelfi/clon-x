
import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/Profile.css'

function Followers() {
  const [users, setUsers] = useState([
    { id: 1, fullName: 'Andrés López', username: 'andres_dev', isFollowing: false },
    { id: 2, fullName: 'Camila Ríos', username: 'camila_codes', isFollowing: true },
    { id: 3, fullName: 'Daniel Mesa', username: 'daniel_tech', isFollowing: false },
    { id: 4, fullName: 'Laura Restrepo', username: 'laura_design', isFollowing: true },
    { id: 5, fullName: 'Sofía Torres', username: 'sofia_web', isFollowing: false }
  ])

  const [currentPage, setCurrentPage] = useState(1)

  const sortedUsers = [...users].sort((a, b) =>
    a.fullName.localeCompare(b.fullName, 'es')
  )

  const usersPerPage = 10
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const visibleUsers = sortedUsers.slice(
    startIndex,
    startIndex + usersPerPage
  )

  function handleFollow(username) {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.username === username
          ? { ...user, isFollowing: !user.isFollowing }
          : user
      )
    )
  }

  return (
    <main className="profile-page">
      <header className="profile-header">
        <Link to="/users/pablo_dev">← Volver al perfil</Link>
        <h1>Seguidores</h1>
        <p>@pablo_dev</p>
      </header>

      <section className="user-list">
        {visibleUsers.map((user) => (
          <article className="user-list-item" key={user.id}>
            <div className="user-list-avatar">
              {user.fullName.charAt(0)}
            </div>

            <div className="user-list-info">
              <h3>{user.fullName}</h3>
              <p>@{user.username}</p>
            </div>

            <button
              type="button"
              onClick={() => handleFollow(user.username)}
            >
              {user.isFollowing ? 'Siguiendo' : 'Seguir'}
            </button>
          </article>
        ))}
      </section>

      <footer className="profile-header">
        {totalPages > 1 ? (
          <nav className="pagination" aria-label="Paginación de seguidores">
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
          <p>Página 1 de 1</p>
        )}
      </footer>
    </main>
  )
}

export default Followers
