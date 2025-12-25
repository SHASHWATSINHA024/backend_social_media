const cron = require("node-cron");
const { query } = require("../utils/database");
const logger = require("../utils/logger");

/**
 * Initialize the scheduled posts publisher
 * Runs every minute to check for posts that are due to be published
 */
const initScheduler = () => {
    logger.verbose("Initializing scheduler service...");

    // Run every minute
    cron.schedule("* * * * *", async () => {
        try {
            logger.verbose("Checking for scheduled posts...");

            const result = await query(
                `UPDATE posts 
         SET is_published = true 
         WHERE scheduled_at <= NOW() 
         AND is_published = false 
         RETURNING id, user_id, scheduled_at`
            );

            if (result.rowCount > 0) {
                logger.verbose(`Published ${result.rowCount} scheduled posts.`);
                result.rows.forEach(post => {
                    logger.verbose(`Published post ${post.id} for user ${post.user_id} scheduled at ${post.scheduled_at}`);
                });
            }
        } catch (error) {
            logger.critical("Scheduler error:", error);
        }
    });
};

module.exports = { initScheduler };
