
import { useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import '../styles/Profile.css'

const followerUsers = [
  { id: 1, fullName: 'Andrés López', username: 'andres_dev' },
  { id: 2, fullName: 'Camila Ríos', username: 'camila_codes' },
  { id: 3, fullName: 'Daniel Mesa', username: 'daniel_tech' },
  { id: 4, fullName: 'Laura Restrepo', username: 'laura_design' },
  { id: 5, fullName: 'Sofía Torres', username: 'sofia_web' },
  { id: 6, fullName: 'Ana Gómez', username: 'ana_dev' },
  { id: 7, fullName: 'Carlos Pérez', username: 'carlos_code' },
  { id: 8, fullName: 'Mateo Ruiz', username: 'mateo_tech' }
]

function Followers() {
  const { username = 'pablo_dev' } = useParams()
  const {
    followingUsernames,
    setFollowingUsernames
  } = useOutletContext()

  const [currentPage, setCurrentPage] = useState(1)

  const sortedUsers = [...followerUsers].sort((a, b) =>
    a.fullName.localeCompare(b.fullName, 'es')
  )

  const usersPerPage = 10
  const totalPages = Math.max(
    1,
    Math.ceil(sortedUsers.length / usersPerPage)
  )

  const startIndex = (currentPage - 1) * usersPerPage

  const visibleUsers = sortedUsers.slice(
    startIndex,
    startIndex + usersPerPage
  )

  function handleFollow(targetUsername) {
    setFollowingUsernames(currentUsernames => {
      if (currentUsernames.includes(targetUsername)) {
        return currentUsernames.filter(
          currentUsername => currentUsername !== targetUsername
        )
      }

      return [...currentUsernames, targetUsername]
    })
  }

  return (
    <main className="profile-page">
      <header className="profile-header">
        <Link to={`/users/${username}`}>
          ← Volver al perfil
        </Link>

        <h1>Seguidores</h1>
        <p>@{username}</p>
      </header>

      <section className="user-list">
        {visibleUsers.map(user => {
          const isFollowing = followingUsernames.includes(user.username)

          return (
            <article className="user-list-item" key={user.id}>
              <div className="user-list-avatar">
                {user.fullName.charAt(0).toUpperCase()}
              </div>

              <div className="user-list-info">
                <h3>{user.fullName}</h3>
                <p>@{user.username}</p>
              </div>

              <div className="user-list-actions">
                <Link
                  to={`/users/${user.username}`}
                  className="sidebar__button"
                >
                  Ver perfil
                </Link>

                {user.username !== 'pablo_dev' && (
                  <button
                    type="button"
                    onClick={() => handleFollow(user.username)}
                  >
                    {isFollowing ? 'Siguiendo' : 'Seguir'}
                  </button>
                )}
              </div>
            </article>
          )
        })}
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

export default Followers
