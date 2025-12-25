const { query } = require("../utils/database");
const logger = require("../utils/logger");

/**
 * Follow a user
 */
const followUser = async (req, res) => {
	try {
		const followerId = req.user.id;
		const { followingId } = req.body;

		if (followerId === parseInt(followingId)) {
			return res.status(400).json({ error: "You cannot follow yourself" });
		}

		// Check if user exists
		const userCheck = await query("SELECT id FROM users WHERE id = $1", [
			followingId,
		]);
		if (userCheck.rows.length === 0) {
			return res.status(404).json({ error: "User not found" });
		}

		await query(
			"INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
			[followerId, followingId]
		); // On conflict do nothing essentially means if already following, it's a success

		res.json({ message: "Successfully followed user" });
	} catch (error) {
		logger.critical("Follow user error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

/**
 * Unfollow a user
 */
const unfollowUser = async (req, res) => {
	try {
		const followerId = req.user.id;
		const { followingId } = req.body;

		await query(
			"DELETE FROM follows WHERE follower_id = $1 AND following_id = $2",
			[followerId, followingId]
		);

		res.json({ message: "Successfully unfollowed user" });
	} catch (error) {
		logger.error("Unfollow user error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

/**
 * Get users that the current user is following
 */
const getFollowing = async (req, res) => {
	try {
		const userId = req.user.id;
		const result = await query(
			`SELECT u.id, u.username, u.full_name 
             FROM users u 
             JOIN follows f ON u.id = f.following_id 
             WHERE f.follower_id = $1`,
			[userId]
		);

		res.json({ following: result.rows });
	} catch (error) {
		logger.error("Get following error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

/**
 * Get users that follow the current user
 */
const getFollowers = async (req, res) => {
	try {
		const userId = req.user.id;
		const result = await query(
			`SELECT u.id, u.username, u.full_name 
             FROM users u 
             JOIN follows f ON u.id = f.follower_id 
             WHERE f.following_id = $1`,
			[userId]
		);

		res.json({ followers: result.rows });
	} catch (error) {
		logger.error("Get followers error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

/**
 * Get follow stats
 */
const getStats = async (req, res) => {
	try {
		const userId = req.user.id;

		const followersCount = await query(
			"SELECT COUNT(*) FROM follows WHERE following_id = $1",
			[userId]
		);
		const followingCount = await query(
			"SELECT COUNT(*) FROM follows WHERE follower_id = $1",
			[userId]
		);

		res.json({
			followers: parseInt(followersCount.rows[0].count),
			following: parseInt(followingCount.rows[0].count),
		});
	} catch (error) {
		logger.error("Get stats error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

/**
 * Search users by name
 */
const searchUsers = async (req, res) => {
	try {
		const { q } = req.query;
		if (!q) {
			return res.status(400).json({ error: "Search query is required" });
		}

		const result = await query(
			"SELECT id, username, full_name FROM users WHERE username ILIKE $1 OR full_name ILIKE $1 LIMIT 20",
			[`%${q}%`]
		);

		res.json({ users: result.rows });
	} catch (error) {
		logger.error("Search users error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

module.exports = {
	followUser,
	unfollowUser,
	getFollowing,
	getFollowers,
	getStats,
	searchUsers,
};
