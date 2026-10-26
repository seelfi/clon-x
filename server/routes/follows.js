const express = require('express')
const pool = require('../db')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { username } = req.body

    if (!username) {
      return res.status(400).json({
        message: 'El nombre de usuario es obligatorio'
      })
    }

    const [users] = await pool.execute(
      `SELECT id, full_name, username
       FROM users
       WHERE username = ?`,
      [username]
    )

    if (users.length === 0) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      })
    }

    const followedUser = users[0]

    if (followedUser.id === req.user.id) {
      return res.status(400).json({
        message: 'No puedes seguirte a ti mismo'
      })
    }

    const [existingFollow] = await pool.execute(
      `SELECT follower_id
       FROM follows
       WHERE follower_id = ?
         AND followed_id = ?`,
      [req.user.id, followedUser.id]
    )

    if (existingFollow.length > 0) {
      return res.status(409).json({
        message: 'Ya sigues a este usuario'
      })
    }

    await pool.execute(
      `INSERT INTO follows (follower_id, followed_id)
       VALUES (?, ?)`,
      [req.user.id, followedUser.id]
    )

    res.status(201).json({
      message: 'Usuario seguido correctamente',
      user: {
        id: followedUser.id,
        fullName: followedUser.full_name,
        username: followedUser.username
      }
    })
  } catch (error) {
    console.error('Error al seguir usuario:', error)

    res.status(500).json({
      message: 'Error interno del servidor'
    })
  }
})

module.exports = router