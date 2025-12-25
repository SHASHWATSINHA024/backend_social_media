const express = require("express");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

/**
 * User-related routes
 * TODO: Implement user routes when follow functionality is added
 */

const userController = require("../controllers/users");

// Search users
router.get("/search", authenticateToken, userController.searchUsers);

// Follow/Unfollow
router.post("/follow", authenticateToken, userController.followUser);
router.post("/unfollow", authenticateToken, userController.unfollowUser);

// Get lists
router.get("/following", authenticateToken, userController.getFollowing);
router.get("/followers", authenticateToken, userController.getFollowers);

// Get stats
router.get("/stats", authenticateToken, userController.getStats);

module.exports = router;
