const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

const authRoutes = require('./routes/auth')
const usersRoutes = require('./routes/users')

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)

const posts = [
  {
    id: 1,
    content: '¡Nuestra API REST ya está en construcción!',
    author: 'usuario_demo',
    likes: 0
  }
]

app.get('/api/posts', (req, res) => {
  res.json(posts)
})

app.post('/api/posts', (req, res) => {
  const { content, author } = req.body

  if (!content || !author) {
    return res.status(400).json({
      error: 'El contenido y el autor son obligatorios'
    })
  }

  const newPost = {
    id: posts.length + 1,
    content,
    author,
    likes: 0
  }

  posts.push(newPost)

  res.status(201).json(newPost)
})

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`)
})