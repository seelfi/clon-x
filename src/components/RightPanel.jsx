
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/RightPanel.css'

function RightPanel({
  posts,
  followingUsernames,
  setFollowingUsernames
}) {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    if (!message) return

    const timeoutId = setTimeout(() => {
      setMessage('')
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [message])

  // Search users from the backend
  useEffect(() => {
    const query = searchTerm.trim()

    if (!query) {
      setSuggestions([])
      setSearchLoading(false)
      setSearchError('')
      return undefined
    }

    let cancelled = false

    const timeoutId = setTimeout(async () => {
      setSearchLoading(true)
      setSearchError('')

      try {
        const token = localStorage.getItem('token')

        if (!token) {
          throw new Error('Inicia sesión para buscar usuarios.')
        }

        const apiUrl =
          import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

        const response = await fetch(
          `${apiUrl}/users/search?q=${encodeURIComponent(query)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'No se pudo buscar usuarios.')
        }

        if (!cancelled) {
          setSuggestions(data.items || [])
        }
      } catch (error) {
        if (!cancelled) {
          setSuggestions([])
          setSearchError(error.message || 'Error al buscar usuarios.')
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false)
        }
      }
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [searchTerm])

  function handleSelectUser(targetUsername) {
    setSearchTerm('')
    setSuggestions([])
    setShowSuggestions(false)
    navigate(`/users/${encodeURIComponent(targetUsername)}`)
  }

  function handleFollow(event) {
    event.preventDefault()

    const targetUsername = username.trim().replace(/^@/, '')

    if (!targetUsername) {
      setMessage('Escribe un nombre de usuario.')
      return
    }

    if (targetUsername.toLowerCase() === 'pablo_dev') {
      setMessage('No puedes seguirte a ti mismo.')
      return
    }

    const userExists = posts.some(
      (post) =>
        post.author.toLowerCase() === targetUsername.toLowerCase()
    )

    if (!userExists) {
      setMessage('No encontramos ese usuario.')
      return
    }

    const alreadyFollowing = followingUsernames.some(
      (followedUsername) =>
        followedUsername.toLowerCase() === targetUsername.toLowerCase()
    )

    if (alreadyFollowing) {
      setMessage('Ya sigues a ese usuario.')
      return
    }

    setFollowingUsernames((currentUsernames) => [
      ...currentUsernames,
      targetUsername
    ])

    setMessage(`Ahora sigues a @${targetUsername}.`)
    setUsername('')
  }

  return (
    <aside className="right-panel">
      <div className="search-box">
        <input
          type="search"
          placeholder="Buscar"
          aria-label="Buscar usuarios"
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          autoComplete="off"
          role="combobox"
          aria-expanded={showSuggestions && searchTerm.trim().length > 0}
          aria-controls="right-panel-search-results"
        />

        {showSuggestions && searchTerm.trim() && (
          <div
            className="search-results"
            id="right-panel-search-results"
            role="listbox"
            aria-label="Usuarios encontrados"
          >
            {searchLoading ? (
              <p className="search-results__message">
                Buscando usuarios...
              </p>
            ) : searchError ? (
              <p className="search-results__message" role="alert">
                {searchError}
              </p>
            ) : suggestions.length > 0 ? (
              suggestions.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className="search-results__item"
                  role="option"
                  aria-selected="false"
                  onClick={() => handleSelectUser(user.username)}
                >
                  <span
                    className="search-results__avatar"
                    aria-hidden="true"
                  >
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>

                  <span className="search-results__user">
                    <strong>{user.fullName}</strong>
                    <span>@{user.username}</span>
                  </span>
                </button>
              ))
            ) : (
              <p className="search-results__message">
                No se encontraron usuarios.
              </p>
            )}
          </div>
        )}
      </div>

      <section className="panel-card follow-card">
        <h2>Seguir a alguien</h2>

        <form onSubmit={handleFollow}>
          <input
            type="text"
            placeholder="Nombre de usuario"
            aria-label="Nombre de usuario para seguir"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value)
              setMessage('')
            }}
          />

          <button type="submit" className="show-more">
            Seguir
          </button>
        </form>

        {message && (
          <p className="follow-card__message" role="status">
            {message}
          </p>
        )}
      </section>

      <section className="panel-card">
        <h2>¿Qué está pasando?</h2>

        <div className="trend">
          <span>Tendencias · Colombia</span>
          <strong>#DesarrolloWeb</strong>
          <small>1.250 publicaciones</small>
        </div>

        <div className="trend">
          <span>Tendencias · Tecnología</span>
          <strong>React</strong>
          <small>850 publicaciones</small>
        </div>

        <div className="trend">
          <span>Tendencias · Programación</span>
          <strong>#JavaScript</strong>
          <small>620 publicaciones</small>
        </div>

        <button className="show-more" type="button">
          Mostrar más
        </button>
      </section>
    </aside>
  )
}

export default RightPanel
