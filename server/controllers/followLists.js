const pool = require('../db')

function getPagination(query) {
  const page = query.page === undefined ? 1 : Number(query.page)
  const size = query.size === undefined ? 10 : Number(query.size)

  if (
    !Number.isSafeInteger(page) ||
    !Number.isSafeInteger(size) ||
    page < 1 ||
    size < 1 ||
    size > 100
  ) {
    return null
  }

  const offset = (page - 1) * size
  if (!Number.isSafeInteger(offset)) return null

  return { page, size, offset }
}

async function getFollowList(req, res, listType) {
  const pagination = getPagination(req.query)

  if (!pagination) {
    return res.status(400).json({
      message: 'Invalid pagination parameters',
    })
  }

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

    const userId = users[0].id
    const isFollowers = listType === 'followers'
    const relationColumn = isFollowers ? 'followed_id' : 'follower_id'
    const personColumn = isFollowers ? 'follower_id' : 'followed_id'

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) AS totalItems FROM follows WHERE ${relationColumn} = ?`,
      [userId]
    )

    const totalItems = Number(countResult[0].totalItems)
    const totalPages = Math.ceil(totalItems / pagination.size)

    const [items] = await pool.execute(
      `SELECT
         u.id,
         u.full_name AS fullName,
         u.username
       FROM follows f
       INNER JOIN users u ON u.id = f.${personColumn}
       WHERE f.${relationColumn} = ?
       ORDER BY u.full_name ASC, u.id ASC
       LIMIT ? OFFSET ?`,
      [userId, pagination.size, pagination.offset]
    )

    return res.status(200).json({
      items,
      page: pagination.page,
      size: pagination.size,
      totalItems,
      totalPages,
    })
  } catch (error) {
    console.error(`Error getting ${listType}:`, error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

function getFollowers(req, res) {
  return getFollowList(req, res, 'followers')
}

function getFollowing(req, res) {
  return getFollowList(req, res, 'following')
}

module.exports = {
  getFollowers,
  getFollowing,
}
