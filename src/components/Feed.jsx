import "../styles/Feed.css";
import { useEffect, useState } from "react";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/posts")
      .then((response) => response.json())
      .then((data) => setPosts(data))
      .catch((error) => console.error("Error al cargar publicaciones:", error));
  }, []);

  function handlePublish() {
    if (!content.trim()) {
      return;
    }

    fetch("http://localhost:3000/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: content,
        author: "pablo_dev",
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("No se pudo crear la publicación");
        }

        return response.json();
      })
      .then((newPost) => {
        setPosts((currentPosts) => [...currentPosts, newPost]);
        setContent("");
      })
      .catch((error) => {
        console.error("Error al publicar:", error);
      });
  }

  return (
    <main className="feed">
      <header className="feed__header">
        <h1>Inicio</h1>
        <div className="feed__tabs">
          <button className="feed__tab feed__tab--active">Para ti</button>
          <button className="feed__tab">Siguiendo</button>
        </div>
      </header>

      <section className="composer">
        <div className="composer__avatar">P</div>
        <div className="composer__content">
          <textarea
            placeholder="¿Qué está pasando?"
            aria-label="Escribe una publicación"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />

          <div className="composer__actions">
            <span>Todos pueden responder</span>
            <button onClick={handlePublish} disabled={!content.trim()}>
              Publicar
            </button>
          </div>
        </div>
      </section>

      {posts.map((post) => (
        <article className="post" key={post.id}>
          <div className="post__avatar">
            {post.author.charAt(0).toUpperCase()}
          </div>

          <div className="post__body">
            <div className="post__author">
              <strong>{post.author}</strong>
              <span>@{post.author} · ahora</span>
            </div>

            <p>{post.content}</p>

            <div className="post__actions">
              <span>♡ {post.likes}</span>
              <span>↻ 0</span>
              <span>💬 0</span>
            </div>
          </div>
        </article>
      ))}
    </main>
  );
}

export default Feed;
