
import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/Profile.css'

function Following() {
  const [currentPage, setCurrentPage] = useState(1)

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

  const usersPerPage = 10
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const visibleUsers = sortedUsers.slice(
    startIndex,
    startIndex + usersPerPage
  )

  return (
    <main className="profile-page">
      <header className="profile-header">
        <Link to="/users/pablo_dev">← Volver al perfil</Link>
        <h1>Siguiendo</h1>
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

            <Link
              to={`/users/${user.username}`}
              className="sidebar__button"
            >
              Ver perfil
            </Link>
          </article>
        ))}
      </section>

      <footer className="profile-header">
        {totalPages > 1 && (
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
        )}

        {totalPages <= 1 && <p>Página 1 de 1</p>}
      </footer>
    </main>
  )
}

export default Following
