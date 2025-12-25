const axios = require('axios');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const testScheduledPost = async () => {
    const BASE_URL = 'http://localhost:3000/api';

    try {
        console.log("Starting Scheduled Post Verification...");

        // Register User
        const user = {
            username: `scheduler${Date.now()}`,
            email: `scheduler${Date.now()}@example.com`,
            password: 'password123',
            full_name: 'Scheduler User'
        };

        console.log("Registering User...");
        const res = await axios.post(`${BASE_URL}/auth/register`, user);
        const token = res.data.token;

        // Create Scheduled Post (scheduled for 1 minute from now)
        const scheduledTime = new Date(Date.now() + 65 * 1000); // 1 minute 5 seconds from now
        console.log(`Scheduling post for ${scheduledTime.toISOString()}...`);

        const postRes = await axios.post(`${BASE_URL}/posts`, {
            content: "This is a scheduled post!",
            scheduled_at: scheduledTime.toISOString()
        }, { headers: { Authorization: token } });

        const postId = postRes.data.post.id;
        console.log(`Post ${postId} created. is_published:`, postRes.data.post.is_published);

        if (postRes.data.post.is_published) {
            console.error("❌ Post should NOT be published yet!");
            return;
        }

        // Check Feed - Should NOT trigger
        console.log("Checking feed (should be empty)...");
        const feedRes1 = await axios.get(`${BASE_URL}/posts/my`, { headers: { Authorization: token } });
        const found1 = feedRes1.data.posts.find(p => p.id === postId);
        if (found1) {
            console.error("❌ Found post in feed/my posts but it should be unpublished!");
        } else {
            console.log("✅ Post correctly hidden from feed.");
        }

        // Wait for scheduler
        console.log("Waiting 75 seconds for scheduler...");
        await sleep(75000);

        // Check Feed - Should trigger
        console.log("Checking feed again (should be visible)...");
        const feedRes2 = await axios.get(`${BASE_URL}/posts/my`, { headers: { Authorization: token } });
        const found2 = feedRes2.data.posts.find(p => p.id === postId);

        if (found2) {
            console.log("✅ Post successfully published by scheduler!");
        } else {
            console.error("❌ Post still NOT visible!");
        }

    } catch (error) {
        console.error("Verification failed:", error.response ? error.response.data : error.message);
    }
};

testScheduledPost();
