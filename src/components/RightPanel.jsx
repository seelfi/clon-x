
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { followUser, searchUsers } from '../services/api'
import '../styles/RightPanel.css'
import { useAuth } from '../context/AuthContext'

function RightPanel() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const currentUser = useAuth().user || {}

  function clearSearchState() {
    setSuggestions([])
    setSearchLoading(false)
    setSearchError('')
  }

  useEffect(() => {
    if (!message) return undefined

    const timeoutId = setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [message])

  // Search users from the backend
  useEffect(() => {
    const query = searchTerm.trim()

    if (!query) {
      return undefined
    }

    let cancelled = false

    const timeoutId = setTimeout(async () => {
      setSearchLoading(true)
      setSearchError('')

      try {
        const data = await searchUsers(query)

        if (!cancelled) {
          setSuggestions(data.items || [])
        }
      } catch (error) {
        if (!cancelled) {
          setSuggestions([])
          setSearchError(
            error.message === 'Error en la solicitud'
              ? 'No se pudo buscar usuarios.'
              : error.message || 'Error al buscar usuarios.'
          )
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
    clearSearchState()
    setShowSuggestions(false)
    navigate(`/users/${encodeURIComponent(targetUsername)}`)
  }

  async function handleFollow(event) {
    event.preventDefault()

    const targetUsername = username.trim().replace(/^@/, '')

    if (!targetUsername) {
      setMessageType('error')
      setMessage('Escribe un nombre de usuario.')
      return
    }

    if (
      targetUsername.toLowerCase() ===
      String(currentUser.username || '').toLowerCase()
    ) {
      setMessageType('error')
      setMessage('No puedes seguirte a ti mismo.')
      return
    }

    try {
      await followUser(targetUsername)

      setMessageType('success')
      setMessage(`Ahora sigues a @${targetUsername}.`)
      setUsername('')
    } catch (error) {
      const errorMessage = error.message || ''

      if (
        errorMessage.toLowerCase().includes('already follow') ||
        errorMessage.toLowerCase().includes('ya sigues')
      ) {
        setMessageType('error')
        setMessage('Ya sigues a ese usuario.')
      } else if (
        errorMessage.toLowerCase().includes('user not found') ||
        errorMessage.toLowerCase().includes('usuario no encontrado')
      ) {
        setMessageType('error')
        setMessage('No encontramos ese usuario.')
      } else if (
        errorMessage.toLowerCase().includes('cannot follow yourself') ||
        errorMessage.toLowerCase().includes('no puedes seguirte')
      ) {
        setMessageType('error')
        setMessage('No puedes seguirte a ti mismo.')
      } else {
        setMessageType('error')
        setMessage(errorMessage || 'No se pudo seguir al usuario.')
      }
    }
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
            const nextSearchTerm = event.target.value
            setSearchTerm(nextSearchTerm)
            if (!nextSearchTerm.trim()) clearSearchState()
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
                    {(user.fullName || user.username || '?')
                      .charAt(0)
                      .toUpperCase()}
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
              setMessageType('')
            }}
          />

          <button type="submit" className="show-more">
            Seguir
          </button>
        </form>

        {message && (
          <p
            className="follow-card__message"
            role="status"
            data-type={messageType}
          >
            {message}
          </p>
        )}
      </section>

      <section className="panel-card">
        <h2>Temas de ejemplo</h2>

        <div className="trend">
          <span>Colombia</span>
          <strong>#DesarrolloWeb</strong>
        </div>

        <div className="trend">
          <span>Tecnología</span>
          <strong>React</strong>
        </div>

        <div className="trend">
          <span>Programación</span>
          <strong>#JavaScript</strong>
        </div>
      </section>
    </aside>
  )
}

export default RightPanel
