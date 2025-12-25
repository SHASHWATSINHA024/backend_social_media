const {
	likePost,
	unlikePost,
	getPostLikes,
	getUserLikes,
} = require("../models/like");
const logger = require("../utils/logger");

const like = async (req, res) => {
	try {
		const userId = req.user.id;
		const { post_id } = req.body;

		if (!post_id) {
			return res.status(400).json({ error: "Post ID is required" });
		}

		await likePost(userId, post_id);
		res.json({ message: "Post liked successfully" });
	} catch (error) {
		logger.critical("Like post error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

const unlike = async (req, res) => {
	try {
		const userId = req.user.id;
		const { post_id } = req.params;

		await unlikePost(userId, parseInt(post_id));
		res.json({ message: "Post unliked successfully" });
	} catch (error) {
		logger.error("Unlike post error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

const getLikes = async (req, res) => {
	try {
		const { post_id } = req.params;
		const likes = await getPostLikes(parseInt(post_id));
		res.json({ likes });
	} catch (error) {
		logger.error("Get post likes error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

const getUserLikeds = async (req, res) => {
	try {
		const { user_id } = req.params;
		const posts = await getUserLikes(parseInt(user_id));
		res.json({ posts });
	} catch (error) {
		logger.error("Get user likes error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

module.exports = {
	like,
	unlike,
	getLikes,
	getUserLikeds,
};
