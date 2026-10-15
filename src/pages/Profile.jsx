
import { Link, useOutletContext, useParams } from 'react-router-dom'
import Tweet from '../components/Tweet'
import '../styles/Profile.css'

const users = [
  {
    fullName: 'Pablo Alvarez',
    username: 'pablo_dev',
    bio: 'Desarrollador en formación 💻'
  },
  {
    fullName: 'Ana Gómez',
    username: 'ana_dev',
    bio: 'Aprendiendo React un componente a la vez. 🚀'
  },
  {
    fullName: 'Carlos Pérez',
    username: 'carlos_code',
    bio: 'Practicando JavaScript y Git.'
  },
  {
    fullName: 'Laura Restrepo',
    username: 'laura_design',
    bio: 'Diseño e interfaces web.'
  },
  {
    fullName: 'Mateo Ruiz',
    username: 'mateo_tech',
    bio: 'Pequeños avances todos los días. 💻'
  },
  {
    fullName: 'Sofía Torres',
    username: 'sofia_web',
    bio: 'Aprendiendo desarrollo web 🚀'
  },
  {
    fullName: 'Andrés López',
    username: 'andres_dev',
    bio: 'Explorando el mundo del desarrollo.'
  },
  {
    fullName: 'Camila Ríos',
    username: 'camila_codes',
    bio: 'Código, creatividad y aprendizaje.'
  },
  {
    fullName: 'Daniel Mesa',
    username: 'daniel_tech',
    bio: 'Tecnología y programación.'
  }
]

function Profile() {
  const { username } = useParams()

  const {
    posts,
    followingUsernames,
    setFollowingUsernames,
    followingByUser
  } = useOutletContext()

  const user = users.find(item => item.username === username)

  if (!user) {
    return (
      <main className="profile-page">
        <header className="profile-header">
          <h1>Usuario no encontrado</h1>
          <p>No existe un perfil para @{username}.</p>
          <Link to="/">Volver al inicio</Link>
        </header>
      </main>
    )
  }

  const isOwnProfile = username === 'pablo_dev'
  const isFollowing = followingUsernames.includes(username)

  const followingCount = (
    followingByUser[username] || []
  ).length

  const followersCount = Object.values(followingByUser).filter(
    usernames => usernames.includes(username)
  ).length

  const userTweets = posts
    .filter(post => post.author === username)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )

  function handleFollow() {
    setFollowingUsernames(currentUsernames => {
      if (currentUsernames.includes(username)) {
        return currentUsernames.filter(
          currentUsername => currentUsername !== username
        )
      }

      return [...currentUsernames, username]
    })
  }

  return (
    <main className="profile-page">
      <header className="profile-header">
        <Link to="/">← Volver al inicio</Link>
        <h1>{user.fullName}</h1>
        <p>Perfil de usuario</p>
      </header>

      <section className="profile-info">
        <div className="profile-avatar">
          {user.fullName.charAt(0).toUpperCase()}
        </div>

        <h2>{user.fullName}</h2>
        <p>@{user.username}</p>
        <p>{user.bio}</p>

        <div className="profile-stats">
          <Link to={`/users/${username}/following`}>
            <strong>{followingCount}</strong> Siguiendo
          </Link>

          <Link to={`/users/${username}/followers`}>
            <strong>{followersCount}</strong> Seguidores
          </Link>
        </div>

        {!isOwnProfile && (
          <button type="button" onClick={handleFollow}>
            {isFollowing ? 'Siguiendo' : 'Seguir'}
          </button>
        )}
      </section>

      <h3 className="profile-tweets-title">Publicaciones</h3>

      <section className="profile-tweets">
        {userTweets.length > 0 ? (
          userTweets.map(post => (
            <Tweet key={post.id} post={post} />
          ))
        ) : (
          <p className="empty-state">
            Este usuario todavía no tiene publicaciones.
          </p>
        )}
      </section>
    </main>
  )
}

export default Profile
