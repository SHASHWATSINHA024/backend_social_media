const {
	createComment,
	updateComment,
	deleteComment,
	getPostComments,
} = require("../models/comment");
const logger = require("../utils/logger");

const create = async (req, res) => {
	try {
		const userId = req.user.id;
		const { post_id, content } = req.body;

		if (!post_id || !content) {
			return res
				.status(400)
				.json({ error: "Post ID and content are required" });
		}

		const comment = await createComment({ userId, postId: post_id, content });
		res.status(201).json({ message: "Comment created successfully", comment });
	} catch (error) {
		logger.critical("Create comment error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

const update = async (req, res) => {
	try {
		const userId = req.user.id;
		const { comment_id } = req.params;
		const { content } = req.body;

		if (!content) {
			return res.status(400).json({ error: "Content is required" });
		}

		const comment = await updateComment(parseInt(comment_id), userId, content);

		if (!comment) {
			return res
				.status(404)
				.json({ error: "Comment not found or unauthorized" });
		}

		res.json({ message: "Comment updated successfully", comment });
	} catch (error) {
		logger.error("Update comment error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

const remove = async (req, res) => {
	try {
		const userId = req.user.id;
		const { comment_id } = req.params;

		const success = await deleteComment(parseInt(comment_id), userId);

		if (!success) {
			return res
				.status(404)
				.json({ error: "Comment not found or unauthorized" });
		}

		res.json({ message: "Comment deleted successfully" });
	} catch (error) {
		logger.error("Delete comment error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

const getComments = async (req, res) => {
	try {
		const { post_id } = req.params;
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 50;
		const offset = (page - 1) * limit;

		const comments = await getPostComments(parseInt(post_id), limit, offset);
		res.json({ comments });
	} catch (error) {
		logger.error("Get comments error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

module.exports = {
	create,
	update,
	remove,
	getComments,
};
