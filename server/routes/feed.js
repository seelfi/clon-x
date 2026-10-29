
const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const size = Number(req.query.size) || 10;

    if (
      !Number.isSafeInteger(page) ||
      !Number.isSafeInteger(size) ||
      page < 1 ||
      size < 1 ||
      size > 100
    ) {
      return res.status(400).json({
        message: "Page must be positive and size must be between 1 and 100",
      });
    }

    const offset = (page - 1) * size;
    const userId = req.user.id;

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) AS totalItems
       FROM tweets t
       WHERE t.author_id = ?
          OR t.author_id IN (
            SELECT followed_id
            FROM follows
            WHERE follower_id = ?
          )`,
      [userId, userId]
    );

    const totalItems = Number(countResult[0].totalItems);
    const totalPages = Math.ceil(totalItems / size);

    const [tweets] = await pool.execute(
      `SELECT
         t.id,
         t.content,
         t.created_at,
         u.id AS author_id,
         u.full_name,
         u.username,

         (SELECT COUNT(*)
          FROM tweet_likes l
          WHERE l.tweet_id = t.id) AS likesCount,

         (SELECT COUNT(*)
          FROM retweets r
          WHERE r.tweet_id = t.id) AS retweetsCount,

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
           FROM retweets r
           WHERE r.tweet_id = t.id
             AND r.user_id = ?
         ) AS retweetedByMe

       FROM tweets t
       INNER JOIN users u ON t.author_id = u.id
       WHERE t.author_id = ?
          OR t.author_id IN (
            SELECT followed_id
            FROM follows
            WHERE follower_id = ?
          )
       ORDER BY t.created_at DESC, t.id DESC
       LIMIT ? OFFSET ?`,
      [userId, userId, userId, userId, size, offset]
    );

    const items = tweets.map((tweet) => ({
      id: tweet.id,
      content: tweet.content,
      createdAt: tweet.created_at,
      author: {
        id: tweet.author_id,
        fullName: tweet.full_name,
        username: tweet.username,
      },
      likesCount: Number(tweet.likesCount),
      retweetsCount: Number(tweet.retweetsCount),
      commentsCount: Number(tweet.commentsCount),
      likedByMe: Boolean(tweet.likedByMe),
      retweetedByMe: Boolean(tweet.retweetedByMe),
    }));

    return res.status(200).json({
      items,
      page,
      size,
      totalItems,
      totalPages,
    });
  } catch (error) {
    console.error("Error getting feed:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

module.exports = router;
