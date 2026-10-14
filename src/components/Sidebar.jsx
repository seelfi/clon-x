import { Link, NavLink } from 'react-router-dom'
import '../styles/Sidebar.css'

function Sidebar() {
  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar__logo">
        𝕏
      </Link>

      <nav className="sidebar__nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <span>⌂</span> Inicio
        </NavLink>

        <NavLink
          to="/users/pablo_dev"
          end
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <span>♙</span> Perfil
        </NavLink>

        <NavLink
          to="/users/pablo_dev/following"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <span>♧</span> Siguiendo
        </NavLink>

        <NavLink
          to="/users/pablo_dev/followers"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <span>♧</span> Seguidores
        </NavLink>
      </nav>

      <Link to="/publish" className="sidebar__button">
        Publicar
      </Link>

      <div className="sidebar__auth">
        <Link to="/login" className="sidebar__auth-link">
          Iniciar sesión
        </Link>

        <Link to="/register" className="sidebar__auth-link">
          Registro
        </Link>
      </div>
    </aside>
  )
}

export default Sidebar