const axios = require('axios');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const testFlow = async () => {
    const BASE_URL = 'http://localhost:3000/api';

    try {
        console.log("Starting verification...");

        // 1. Register User A
        const userA = {
            username: `usera${Date.now()}`,
            email: `usera${Date.now()}@example.com`,
            password: 'password123',
            full_name: 'User A'
        };

        console.log("Registering User A...");
        const resA = await axios.post(`${BASE_URL}/auth/register`, userA);
        const tokenA = resA.data.token;
        const idA = resA.data.user.id;
        console.log("User A registered:", idA);

        // 2. Register User B
        const userB = {
            username: `userb${Date.now()}`,
            email: `userb${Date.now()}@example.com`,
            password: 'password123',
            full_name: 'User B'
        };

        console.log("Registering User B...");
        const resB = await axios.post(`${BASE_URL}/auth/register`, userB);
        const tokenB = resB.data.token;
        const idB = resB.data.user.id;
        console.log("User B registered:", idB);

        // 3. User B Posts Content
        console.log("User B posting content...");
        const postRes = await axios.post(`${BASE_URL}/posts`, {
            content: "Hello World from User B!",
            media_url: "http://example.com/image.jpg",
            comments_enabled: true
        }, { headers: { Authorization: tokenB } });
        const postId = postRes.data.post.id;
        console.log("User B posted:", postId);

        // 4. User A Follows User B
        console.log("User A following User B...");
        await axios.post(`${BASE_URL}/users/follow`, { followingId: idB }, { headers: { Authorization: tokenA } });
        console.log("User A followed User B");

        // 5. User A Checks Feed
        console.log("User A checking feed...");
        const feedRes = await axios.get(`${BASE_URL}/posts/feed`, { headers: { Authorization: tokenA } });
        const feedPosts = feedRes.data.feed;
        const foundPost = feedPosts.find(p => p.id === postId);

        if (foundPost) {
            console.log("✅ User A sees User B's post in feed");
        } else {
            console.error("❌ User A DOES NOT see User B's post in feed");
        }

        // 6. User A Likes User B's Post
        console.log("User A liking post...");
        await axios.post(`${BASE_URL}/likes`, { post_id: postId }, { headers: { Authorization: tokenA } });
        console.log("User A liked post");

        // Verify Like Count
        const likeRes = await axios.get(`${BASE_URL}/likes/post/${postId}`, { headers: { Authorization: tokenA } });
        // Assuming getLikes returns { likes: [...] }
        if (likeRes.data.likes.some(l => l.id === idA)) {
            console.log("✅ Like verified");
        } else {
            console.error("❌ Like verification failed");
        }

        // 7. User A Comments on User B's Post
        console.log("User A commenting...");
        await axios.post(`${BASE_URL}/comments`, { post_id: postId, content: "Great post!" }, { headers: { Authorization: tokenA } });
        console.log("User A commented");

        // Verify Comment
        const commentRes = await axios.get(`${BASE_URL}/comments/post/${postId}`, { headers: { Authorization: tokenA } });
        if (commentRes.data.comments.some(c => c.content === "Great post!" && c.user_id === idA)) {
            console.log("✅ Comment verified");
        } else {
            console.error("❌ Comment verification failed");
        }

        console.log("🎉 All verification steps completed successfully!");

    } catch (error) {
        console.error("Verification failed:", error.response ? error.response.data : error.message);
        process.exit(1);
    }
};

testFlow();
