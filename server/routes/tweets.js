const express = require('express')
const pool = require('../db')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body

    // Validar contenido
    if (!content || !content.trim()) {
      return res.status(400).json({
        message: 'El contenido del tweet es obligatorio'
      })
    }

    // Validar longitud máxima
    if (content.length > 280) {
      return res.status(400).json({
        message: 'El tweet no puede superar los 280 caracteres'
      })
    }

    // Crear tweet asociado al usuario autenticado
    const [result] = await pool.execute(
      `INSERT INTO tweets (author_id, content)
       VALUES (?, ?)`,
      [req.user.id, content.trim()]
    )

    // Obtener el tweet recién creado
    const [tweets] = await pool.execute(
      `SELECT
         t.id,
         t.content,
         t.created_at,
         u.id AS author_id,
         u.full_name,
         u.username
       FROM tweets t
       INNER JOIN users u ON t.author_id = u.id
       WHERE t.id = ?`,
      [result.insertId]
    )

    const tweet = tweets[0]

    res.status(201).json({
      id: tweet.id,
      content: tweet.content,
      createdAt: tweet.created_at,
      author: {
        id: tweet.author_id,
        fullName: tweet.full_name,
        username: tweet.username
      }
    })
  } catch (error) {
    console.error('Error al crear tweet:', error)

    res.status(500).json({
      message: 'Error interno del servidor'
    })
  }
})

module.exports = router