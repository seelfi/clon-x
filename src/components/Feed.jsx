
function Feed() {
  return (
    <main className="feed">
      <header className="feed__header">
        <h1>Inicio</h1>
        <div className="feed__tabs">
          <button className="feed__tab feed__tab--active">
            Para ti
          </button>
          <button className="feed__tab">
            Siguiendo
          </button>
        </div>
      </header>

      <section className="composer">
        <div className="composer__avatar">P</div>
        <div className="composer__content">
          <textarea
            placeholder="¿Qué está pasando?"
            aria-label="Escribe una publicación"
          />
          <div className="composer__actions">
            <span>Todos pueden responder</span>
            <button disabled>Publicar</button>
          </div>
        </div>
      </section>

      <article className="post">
        <div className="post__avatar">X</div>
        <div className="post__body">
          <div className="post__author">
            <strong>Bienvenido a X</strong>
            <span>@bienvenido · ahora</span>
          </div>
          <p>
            Este es nuestro primer feed. Poco a poco construiremos
            las funciones de una red social real con React.
          </p>
          <div className="post__actions">
            <span>♡ 0</span>
            <span>↻ 0</span>
            <span>💬 0</span>
          </div>
        </div>
      </article>
    </main>
  )
}

export default Feed

