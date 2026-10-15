
import { useEffect, useState } from 'react'
import '../styles/RightPanel.css'

function RightPanel({
  posts,
  followingUsernames,
  setFollowingUsernames
}) {
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!message) return

    const timeoutId = setTimeout(() => {
      setMessage('')
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [message])

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
          aria-label="Buscar"
        />
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
