
const express = require('express')
const pool = require('../db')
const authMiddleware = require('../middleware/authMiddleware')
const { getFollowers, getFollowing } = require('../controllers/followLists')

const router = express.Router()

// Follow a user
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { username } = req.body

    if (!username) {
      return res.status(400).json({
        message: 'Username is required',
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
        message: 'User not found',
      })
    }

    const followedUser = users[0]

    if (Number(followedUser.id) === Number(req.user.id)) {
      return res.status(400).json({
        message: 'You cannot follow yourself',
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
        message: 'You already follow this user',
      })
    }

    await pool.execute(
      `INSERT INTO follows (follower_id, followed_id)
       VALUES (?, ?)`,
      [req.user.id, followedUser.id]
    )

    return res.status(201).json({
      message: 'User followed successfully',
      user: {
        id: followedUser.id,
        fullName: followedUser.full_name,
        username: followedUser.username,
      },
    })
  } catch (error) {
    console.error('Error following user:', error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
})

// Unfollow a user
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const { username } = req.body

    if (!username) {
      return res.status(400).json({
        message: 'Username is required',
      })
    }

    const [users] = await pool.execute(
      `SELECT id, username
       FROM users
       WHERE username = ?`,
      [username]
    )

    if (users.length === 0) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    const followedUser = users[0]

    if (Number(followedUser.id) === Number(req.user.id)) {
      return res.status(400).json({
        message: 'You cannot unfollow yourself',
      })
    }

    const [result] = await pool.execute(
      `DELETE FROM follows
       WHERE follower_id = ?
         AND followed_id = ?`,
      [req.user.id, followedUser.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'You do not follow this user',
      })
    }

    return res.status(200).json({
      message: 'User unfollowed successfully',
      username: followedUser.username,
    })
  } catch (error) {
    console.error('Error unfollowing user:', error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
})

// Get a user's followers
router.get('/:username/followers', authMiddleware, getFollowers)

// Get users followed by a user
router.get('/:username/following', authMiddleware, getFollowing)

// Check whether the authenticated user follows a user
router.get('/:username/status', authMiddleware, async (req, res) => {
  try {
    const { username } = req.params

    const [users] = await pool.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    )

    if (users.length === 0) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    const followedUserId = users[0].id

    const [follows] = await pool.execute(
      `SELECT follower_id
       FROM follows
       WHERE follower_id = ?
         AND followed_id = ?`,
      [req.user.id, followedUserId]
    )

    return res.status(200).json({
      isFollowing: follows.length > 0,
    })
  } catch (error) {
    console.error('Error checking follow status:', error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
})

module.exports = router
