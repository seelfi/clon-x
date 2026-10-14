import '../styles/RightPanel.css'

function RightPanel() {
  return (
    <aside className="right-panel">
      <div className="search-box">
        <input
          type="search"
          placeholder="Buscar"
          aria-label="Buscar"
        />
      </div>

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

        <button className="show-more">Mostrar más</button>
      </section>
    </aside>
  )
}

export default RightPanel
