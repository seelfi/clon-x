
function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="sidebar__logo">𝕏</h2>

      <nav className="sidebar__nav">
        <a href="#" className="sidebar__link sidebar__link--active">
          <span>⌂</span> Inicio
        </a>

        <a href="#" className="sidebar__link">
          <span>⌕</span> Explorar
        </a>

        <a href="#" className="sidebar__link">
          <span>♙</span> Perfil
        </a>
      </nav>

      <button className="sidebar__button">
        Publicar
      </button>
    </aside>
  )
}

export default Sidebar
