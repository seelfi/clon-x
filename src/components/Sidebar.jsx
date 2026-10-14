
import { Link } from 'react-router-dom'
import '../styles/Sidebar.css'

function Sidebar() {
  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar__logo">
        𝕏
      </Link>

      <nav className="sidebar__nav">
        <Link to="/" className="sidebar__link sidebar__link--active">
          <span>⌂</span> Inicio
        </Link>

        <Link to="/users/pablo_dev" className="sidebar__link">
          <span>♙</span> Perfil
        </Link>

        <Link to="/users/pablo_dev/following" className="sidebar__link">
          <span>♧</span> Siguiendo
        </Link>

        <Link to="/users/pablo_dev/followers" className="sidebar__link">
          <span>♧</span> Seguidores
        </Link>
      </nav>

      <Link to="/publish" className="sidebar__button">
        Publicar
      </Link>
    </aside>
  )
}

export default Sidebar
