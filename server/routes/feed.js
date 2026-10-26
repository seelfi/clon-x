const express = require('express')
const pool = require('../db')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1
    const size = Number(req.query.size) || 10

    if (page < 1 || size < 1) {
      return res.status(400).json({
        message: 'Page and size must be greater than 0'
      })
    }

    const offset = (page - 1) * size

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) AS totalItems
       FROM tweets t
       WHERE t.author_id = ?
          OR t.author_id IN (
            SELECT followed_id
            FROM follows
            WHERE follower_id = ?
          )`,
      [req.user.id, req.user.id]
    )

    const totalItems = countResult[0].totalItems
    const totalPages = Math.ceil(totalItems / size)

    const [tweets] = await pool.query(
      `SELECT
         t.id,
         t.content,
         t.created_at,
         u.id AS author_id,
         u.full_name,
         u.username
       FROM tweets t
       INNER JOIN users u ON t.author_id = u.id
       WHERE t.author_id = ?
          OR t.author_id IN (
            SELECT followed_id
            FROM follows
            WHERE follower_id = ?
          )
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, req.user.id, size, offset]
    )

    const items = tweets.map(tweet => ({
      id: tweet.id,
      content: tweet.content,
      createdAt: tweet.created_at,
      author: {
        id: tweet.author_id,
        fullName: tweet.full_name,
        username: tweet.username
      }
    }))

    res.status(200).json({
      items,
      page,
      size,
      totalItems,
      totalPages
    })
  } catch (error) {
    console.error('Error al obtener el feed:', error)

    res.status(500).json({
      message: 'Error interno del servidor'
    })
  }
})

module.exports = router