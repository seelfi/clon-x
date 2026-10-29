
const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Validate tweet ID parameters
function getValidTweetId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// Create a tweet
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        message: "Tweet content is required",
      });
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length > 280) {
      return res.status(400).json({
        message: "Tweet cannot exceed 280 characters",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO tweets (author_id, content)
       VALUES (?, ?)`,
      [req.user.id, trimmedContent]
    );

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
    );

    const tweet = tweets[0];

    return res.status(201).json({
      id: tweet.id,
      content: tweet.content,
      createdAt: tweet.created_at,
      author: {
        id: tweet.author_id,
        fullName: tweet.full_name,
        username: tweet.username,
      },
    });
  } catch (error) {
    console.error("Error creating tweet:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Toggle a like on a tweet
router.post("/:id/like", authMiddleware, async (req, res) => {
  try {
    const tweetId = getValidTweetId(req.params.id);

    if (!tweetId) {
      return res.status(400).json({ message: "Invalid tweet ID" });
    }

    const [tweets] = await pool.execute(
      "SELECT id FROM tweets WHERE id = ?",
      [tweetId]
    );

    if (!tweets.length) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    const [existingLikes] = await pool.execute(
      `SELECT id FROM tweet_likes
       WHERE user_id = ? AND tweet_id = ?`,
      [req.user.id, tweetId]
    );

    let liked;

    if (existingLikes.length) {
      await pool.execute(
        `DELETE FROM tweet_likes
         WHERE user_id = ? AND tweet_id = ?`,
        [req.user.id, tweetId]
      );
      liked = false;
    } else {
      await pool.execute(
        `INSERT INTO tweet_likes (user_id, tweet_id)
         VALUES (?, ?)`,
        [req.user.id, tweetId]
      );
      liked = true;
    }

    const [counts] = await pool.execute(
      "SELECT COUNT(*) AS likesCount FROM tweet_likes WHERE tweet_id = ?",
      [tweetId]
    );

    return res.status(200).json({
      tweetId,
      liked,
      likesCount: Number(counts[0].likesCount),
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Toggle a retweet
router.post("/:id/retweet", authMiddleware, async (req, res) => {
  try {
    const tweetId = getValidTweetId(req.params.id);

    if (!tweetId) {
      return res.status(400).json({ message: "Invalid tweet ID" });
    }

    const [tweets] = await pool.execute(
      "SELECT id FROM tweets WHERE id = ?",
      [tweetId]
    );

    if (!tweets.length) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    const [existingRetweets] = await pool.execute(
      `SELECT id FROM retweets
       WHERE user_id = ? AND tweet_id = ?`,
      [req.user.id, tweetId]
    );

    let retweeted;

    if (existingRetweets.length) {
      await pool.execute(
        `DELETE FROM retweets
         WHERE user_id = ? AND tweet_id = ?`,
        [req.user.id, tweetId]
      );
      retweeted = false;
    } else {
      await pool.execute(
        `INSERT INTO retweets (user_id, tweet_id)
         VALUES (?, ?)`,
        [req.user.id, tweetId]
      );
      retweeted = true;
    }

    const [counts] = await pool.execute(
      "SELECT COUNT(*) AS retweetsCount FROM retweets WHERE tweet_id = ?",
      [tweetId]
    );

    return res.status(200).json({
      tweetId,
      retweeted,
      retweetsCount: Number(counts[0].retweetsCount),
    });
  } catch (error) {
    console.error("Error toggling retweet:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Get comments for a tweet
router.get("/:id/comments", authMiddleware, async (req, res) => {
  try {
    const tweetId = getValidTweetId(req.params.id);

    if (!tweetId) {
      return res.status(400).json({ message: "Invalid tweet ID" });
    }

    const [tweets] = await pool.execute(
      "SELECT id FROM tweets WHERE id = ?",
      [tweetId]
    );

    if (!tweets.length) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    const [comments] = await pool.execute(
      `SELECT
         c.id,
         c.content,
         c.created_at AS createdAt,
         u.id AS userId,
         u.full_name AS fullName,
         u.username
       FROM comments c
       INNER JOIN users u ON c.user_id = u.id
       WHERE c.tweet_id = ?
       ORDER BY c.created_at ASC, c.id ASC`,
      [tweetId]
    );

    return res.status(200).json({ items: comments });
  } catch (error) {
    console.error("Error getting comments:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Create a comment
router.post("/:id/comments", authMiddleware, async (req, res) => {
  try {
    const tweetId = getValidTweetId(req.params.id);
    const { content } = req.body;

    if (!tweetId) {
      return res.status(400).json({ message: "Invalid tweet ID" });
    }

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        message: "Comment content is required",
      });
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length > 280) {
      return res.status(400).json({
        message: "Comment cannot exceed 280 characters",
      });
    }

    const [tweets] = await pool.execute(
      "SELECT id FROM tweets WHERE id = ?",
      [tweetId]
    );

    if (!tweets.length) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    const [result] = await pool.execute(
      `INSERT INTO comments (user_id, tweet_id, content)
       VALUES (?, ?, ?)`,
      [req.user.id, tweetId, trimmedContent]
    );

    const [comments] = await pool.execute(
      `SELECT
         c.id,
         c.content,
         c.created_at AS createdAt,
         u.id AS userId,
         u.full_name AS fullName,
         u.username
       FROM comments c
       INNER JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [result.insertId]
    );

    return res.status(201).json(comments[0]);
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

module.exports = router;
