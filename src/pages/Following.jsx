
import { useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import '../styles/Profile.css'

const allUsers = [
  { id: 1, fullName: 'Pablo Alvarez', username: 'pablo_dev' },
  { id: 2, fullName: 'Ana Gómez', username: 'ana_dev' },
  { id: 3, fullName: 'Carlos Pérez', username: 'carlos_code' },
  { id: 4, fullName: 'Laura Restrepo', username: 'laura_design' },
  { id: 5, fullName: 'Mateo Ruiz', username: 'mateo_tech' },
  { id: 6, fullName: 'Sofía Torres', username: 'sofia_web' },
  { id: 7, fullName: 'Andrés López', username: 'andres_dev' },
  { id: 8, fullName: 'Camila Ríos', username: 'camila_codes' },
  { id: 9, fullName: 'Daniel Mesa', username: 'daniel_tech' }
]

function Following() {
  const { username = 'pablo_dev' } = useParams()
  const { followingUsernames } = useOutletContext()
  const [currentPage, setCurrentPage] = useState(1)

  const users = allUsers
    .filter(user => followingUsernames.includes(user.username))
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'es'))

  const usersPerPage = 10
  const totalPages = Math.max(1, Math.ceil(users.length / usersPerPage))
  const startIndex = (currentPage - 1) * usersPerPage
  const visibleUsers = users.slice(startIndex, startIndex + usersPerPage)

  return (
    <main className="profile-page">
      <header className="profile-header">
        <Link to={`/users/${username}`}>← Volver al perfil</Link>
        <h1>Siguiendo</h1>
        <p>@{username}</p>
        <p>{users.length} siguiendo</p>
      </header>

      <section className="user-list">
        {visibleUsers.length > 0 ? (
          visibleUsers.map(user => (
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
          ))
        ) : (
          <p className="empty-state">
            Todavía no sigues a ningún usuario.
          </p>
        )}
      </section>

      <footer className="profile-header">
        {totalPages > 1 ? (
          <nav className="pagination" aria-label="Paginación de usuarios">
            <button
              type="button"
              onClick={() => setCurrentPage(page => page - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </button>

            <span>
              Página {currentPage} de {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage(page => page + 1)}
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

export default Following
