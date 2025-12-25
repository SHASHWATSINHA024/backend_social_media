const express = require("express");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

/**
 * Likes routes
 * TODO: Implement like routes when like functionality is added
 */

const likeController = require("../controllers/likes");

// POST /api/likes - Like a post
router.post("/", authenticateToken, likeController.like);

// DELETE /api/likes/:post_id - Unlike a post
router.delete("/:post_id", authenticateToken, likeController.unlike);

// GET /api/likes/post/:post_id - Get likes for a post
router.get("/post/:post_id", authenticateToken, likeController.getLikes);

// GET /api/likes/user/:user_id - Get posts liked by a user
router.get("/user/:user_id", authenticateToken, likeController.getUserLikeds);

module.exports = router;
