
const express = require('express')
const pool = require('../db')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// Get the authenticated user's profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, full_name, username, email, bio, created_at
       FROM users
       WHERE id = ?`,
      [req.user.id]
    )

    if (users.length === 0) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    const user = users[0]

    return res.status(200).json({
      id: user.id,
      fullName: user.full_name,
      username: user.username,
      email: user.email,
      bio: user.bio,
      createdAt: user.created_at,
    })
  } catch (error) {
    console.error('Error getting user profile:', error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
})

// Update the authenticated user's biography
router.put('/me/bio', authMiddleware, async (req, res) => {
  try {
    const { bio } = req.body

    if (typeof bio !== 'string') {
      return res.status(400).json({
        message: 'Bio must be a string',
      })
    }

    const trimmedBio = bio.trim()

    if (trimmedBio.length > 160) {
      return res.status(400).json({
        message: 'Bio cannot exceed 160 characters',
      })
    }

    const [result] = await pool.execute(
      'UPDATE users SET bio = ? WHERE id = ?',
      [trimmedBio, req.user.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    return res.status(200).json({
      message: 'Bio updated successfully',
      bio: trimmedBio,
    })
  } catch (error) {
    console.error('Error updating bio:', error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
})

// Search users by name or username
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const query = String(req.query.q || '').trim()

    if (!query) {
      return res.status(200).json({
        items: [],
      })
    }

    const searchTerm = `%${query}%`

    const [users] = await pool.execute(
      `SELECT id, full_name, username
       FROM users
       WHERE username LIKE ?
          OR full_name LIKE ?
       ORDER BY
         CASE
           WHEN username = ? THEN 0
           WHEN username LIKE ? THEN 1
           ELSE 2
         END,
         username ASC
       LIMIT 8`,
      [
        searchTerm,
        searchTerm,
        query,
        `${query}%`,
      ]
    )

    return res.status(200).json({
      items: users.map((user) => ({
        id: user.id,
        fullName: user.full_name,
        username: user.username,
      })),
    })
  } catch (error) {
    console.error('Error searching users:', error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
})

// Get a public user profile
router.get('/:username', authMiddleware, async (req, res) => {
  try {
    const { username } = req.params

    const [users] = await pool.execute(
      `SELECT
         u.id,
         u.full_name,
         u.username,
         u.bio,
         u.created_at,
         (SELECT COUNT(*)
          FROM follows f
          WHERE f.followed_id = u.id) AS followersCount,
         (SELECT COUNT(*)
          FROM follows f
          WHERE f.follower_id = u.id) AS followingCount
       FROM users u
       WHERE u.username = ?`,
      [username]
    )

    if (users.length === 0) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    const user = users[0]

    return res.status(200).json({
      id: user.id,
      fullName: user.full_name,
      username: user.username,
      bio: user.bio,
      createdAt: user.created_at,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
    })
  } catch (error) {
    console.error('Error getting public profile:', error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
})

// Get a user's tweets with pagination
router.get('/:username/tweets', authMiddleware, async (req, res) => {
  try {
    const { username } = req.params
    const page = Number.parseInt(req.query.page, 10) || 1
    const size = Number.parseInt(req.query.size, 10) || 10

    if (page < 1 || size < 1 || size > 100) {
      return res.status(400).json({
        message: 'Invalid pagination parameters',
      })
    }

    const [users] = await pool.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    )

    if (users.length === 0) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    const userId = users[0].id
    const offset = (page - 1) * size

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) AS totalItems FROM tweets WHERE author_id = ?',
      [userId]
    )

    const totalItems = countResult[0].totalItems

    const [tweets] = await pool.execute(
      `SELECT
         t.id,
         t.content,
         t.created_at,
         u.id AS author_id,
         u.full_name AS author_full_name,
         u.username AS author_username
       FROM tweets t
       INNER JOIN users u ON u.id = t.author_id
       WHERE t.author_id = ?
       ORDER BY t.created_at DESC, t.id DESC
       LIMIT ? OFFSET ?`,
      [userId, size, offset]
    )

    return res.status(200).json({
      items: tweets.map((tweet) => ({
        id: tweet.id,
        content: tweet.content,
        createdAt: tweet.created_at,
        author: {
          id: tweet.author_id,
          fullName: tweet.author_full_name,
          username: tweet.author_username,
        },
      })),
      page,
      size,
      totalItems,
      totalPages: Math.ceil(totalItems / size),
    })
  } catch (error) {
    console.error('Error getting user tweets:', error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
})

/* Get a user's retweets with pagination */
router.get('/:username/retweets', authMiddleware, async (req, res) => {
  try {
    const { username } = req.params;
    const page = Number.parseInt(req.query.page, 10) || 1;
    const size = Number.parseInt(req.query.size, 10) || 10;

    if (page < 1 || size < 1 || size > 100) {
      return res.status(400).json({
        message: 'Invalid pagination parameters',
      });
    }

    const [users] = await pool.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const userId = users[0].id;
    const offset = (page - 1) * size;

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) AS totalItems FROM retweets WHERE user_id = ?',
      [userId]
    );

    const totalItems = Number(countResult[0].totalItems);

    const [tweets] = await pool.execute(
      `SELECT
         t.id,
         t.content,
         t.created_at,
         u.id AS author_id,
         u.full_name AS author_full_name,
         u.username AS author_username,
         r.created_at AS retweeted_at,

         (SELECT COUNT(*)
          FROM tweet_likes l
          WHERE l.tweet_id = t.id) AS likesCount,

         (SELECT COUNT(*)
          FROM retweets r2
          WHERE r2.tweet_id = t.id) AS retweetsCount,

         (SELECT COUNT(*)
          FROM comments c
          WHERE c.tweet_id = t.id) AS commentsCount,

         EXISTS(
           SELECT 1
           FROM tweet_likes l
           WHERE l.tweet_id = t.id
             AND l.user_id = ?
         ) AS likedByMe,

         EXISTS(
           SELECT 1
           FROM retweets r3
           WHERE r3.tweet_id = t.id
             AND r3.user_id = ?
         ) AS retweetedByMe

       FROM retweets r
       INNER JOIN tweets t ON t.id = r.tweet_id
       INNER JOIN users u ON u.id = t.author_id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC, r.id DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, req.user.id, userId, size, offset]
    );

    return res.status(200).json({
      items: tweets.map((tweet) => ({
        id: tweet.id,
        content: tweet.content,
        createdAt: tweet.created_at,
        retweetedAt: tweet.retweeted_at,
        retweetedBy: username,
        author: {
          id: tweet.author_id,
          fullName: tweet.author_full_name,
          username: tweet.author_username,
        },
        likesCount: Number(tweet.likesCount),
        retweetsCount: Number(tweet.retweetsCount),
        commentsCount: Number(tweet.commentsCount),
        likedByMe: Boolean(tweet.likedByMe),
        retweetedByMe: Boolean(tweet.retweetedByMe),
      })),
      page,
      size,
      totalItems,
      totalPages: Math.ceil(totalItems / size),
    });
  } catch (error) {
    console.error('Error getting user retweets:', error);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
});

module.exports = router
