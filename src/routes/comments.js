const express = require("express");
const { authenticateToken, optionalAuth } = require("../middleware/auth");

const router = express.Router();

/**
 * Comments routes
 * TODO: Implement comment routes when comment functionality is added
 */

const commentController = require("../controllers/comments");

// POST /api/comments - Create a comment on a post
router.post("/", authenticateToken, commentController.create);

// PUT /api/comments/:comment_id - Update a comment
router.put("/:comment_id", authenticateToken, commentController.update);

// DELETE /api/comments/:comment_id - Delete a comment
router.delete("/:comment_id", authenticateToken, commentController.remove);

// GET /api/comments/post/:post_id - Get comments for a post
router.get("/post/:post_id", optionalAuth, commentController.getComments);

module.exports = router;
