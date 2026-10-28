
const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;

    // Validate tweet content
    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        message: "Tweet content is required",
      });
    }

    const trimmedContent = content.trim();

    // Validate maximum length
    if (trimmedContent.length > 280) {
      return res.status(400).json({
        message: "Tweet cannot exceed 280 characters",
      });
    }

    // Create tweet for the authenticated user
    const [result] = await pool.execute(
      `INSERT INTO tweets (author_id, content)
       VALUES (?, ?)`,
      [req.user.id, trimmedContent]
    );

    // Get the newly created tweet
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

module.exports = router;
