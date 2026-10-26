const express = require('express')
const pool = require('../db')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, full_name, username, email, created_at
       FROM users
       WHERE id = ?`,
      [req.user.id]
    )

    if (users.length === 0) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      })
    }

    const user = users[0]

    res.status(200).json({
      id: user.id,
      fullName: user.full_name,
      username: user.username,
      email: user.email,
      createdAt: user.created_at
    })
  } catch (error) {
    console.error('Error al obtener usuario:', error)

    res.status(500).json({
      message: 'Error interno del servidor'
    })
  }
})

module.exports = router