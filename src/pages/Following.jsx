
import { useState } from 'react'
import {
  Link,
  useOutletContext,
  useParams
} from 'react-router-dom'
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

  const {
    followingByUser,
    followingUsernames,
    setFollowingUsernames,
    setFollowingByUser
  } = useOutletContext()

  const [currentPage, setCurrentPage] = useState(1)

  const isOwnProfile = username === 'pablo_dev'

  const followedUsernames = isOwnProfile
    ? followingUsernames
    : followingByUser[username] || []

  const users = allUsers
    .filter(user => followedUsernames.includes(user.username))
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'es'))

  const usersPerPage = 10
  const totalPages = Math.max(1, Math.ceil(users.length / usersPerPage))
  const startIndex = (currentPage - 1) * usersPerPage
  const visibleUsers = users.slice(startIndex, startIndex + usersPerPage)

  function handleFollow(targetUsername) {
    if (isOwnProfile) {
      setFollowingUsernames(currentUsernames => {
        if (currentUsernames.includes(targetUsername)) {
          return currentUsernames.filter(
            currentUsername => currentUsername !== targetUsername
          )
        }

        return [...currentUsernames, targetUsername]
      })

      return
    }

    setFollowingByUser(current => {
      const currentUsernames = current[username] || []

      const nextUsernames = currentUsernames.includes(targetUsername)
        ? currentUsernames.filter(item => item !== targetUsername)
        : [...currentUsernames, targetUsername]

      return {
        ...current,
        [username]: nextUsernames
      }
    })
  }

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
          visibleUsers.map(user => {
            const isFollowing = isOwnProfile
              ? followingUsernames.includes(user.username)
              : (followingByUser[username] || []).includes(user.username)

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

                  {user.username !== username && (
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
          })
        ) : (
          <p className="empty-state">
            Este usuario todavía no sigue a nadie.
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

            <span>Página {currentPage} de {totalPages}</span>

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
