const { query } = require("../utils/database");

/**
 * Like model for managing post likes
 * TODO: Implement this model for the like functionality
 */

const likePost = async (userId, postId) => {
	const result = await query(
		"INSERT INTO likes (user_id, post_id, created_at) VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING RETURNING *",
		[userId, postId]
	);
	return result.rowCount > 0;
};

const unlikePost = async (userId, postId) => {
	const result = await query(
		"DELETE FROM likes WHERE user_id = $1 AND post_id = $2",
		[userId, postId]
	);
	return result.rowCount > 0;
};

const getPostLikes = async (postId) => {
	const result = await query(
		`SELECT u.id, u.username, u.full_name
         FROM likes l
         JOIN users u ON l.user_id = u.id
         WHERE l.post_id = $1
         ORDER BY l.created_at DESC`,
		[postId]
	);
	return result.rows;
};

const getUserLikes = async (userId) => {
	const result = await query(
		`SELECT p.*, u.username, u.full_name
         FROM likes l
         JOIN posts p ON l.post_id = p.id
         JOIN users u ON p.user_id = u.id
         WHERE l.user_id = $1
         ORDER BY l.created_at DESC`,
		[userId]
	);
	return result.rows;
};

const hasUserLikedPost = async (userId, postId) => {
	const result = await query(
		"SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2",
		[userId, postId]
	);
	return result.rowCount > 0;
};

module.exports = {
	likePost,
	unlikePost,
	getPostLikes,
	getUserLikes,
	hasUserLikedPost,
};
