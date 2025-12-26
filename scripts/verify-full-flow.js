const axios = require("axios");
const { randomUUID } = require("crypto");

const BASE_URL = "https://backend-social-media-7lv6.onrender.com";
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/* -------- Helpers -------- */

const authHeader = (token) => ({
  headers: { Authorization: token } // raw JWT (your middleware expects this)
});

const cleanId = () =>
  randomUUID().replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);

/* -------- Test Flow -------- */

(async function verifyFullFlow() {
  try {
    console.log("Starting full API verification...");

    /* ========== REGISTER USERS (GET TOKEN HERE) ========== */

    const uidA = cleanId();
    const userA = {
      username: `userA${uidA}`,
      email: `usera${uidA}@example.com`,
      password: "password123",
      full_name: "User A"
    };

    const uidB = cleanId();
    const userB = {
      username: `userB${uidB}`,
      email: `userb${uidB}@example.com`,
      password: "password123",
      full_name: "User B"
    };

    const regA = await axios.post(`${BASE_URL}/api/auth/register`, userA);
    const regB = await axios.post(`${BASE_URL}/api/auth/register`, userB);

    const tokenA = regA.data.token;
    const tokenB = regB.data.token;
    const idA = regA.data.user.id;
    const idB = regB.data.user.id;

    if (!tokenA || !tokenB) {
      throw new Error("Token not returned on registration");
    }

    console.log("✅ Auth verified (via register)");

    /* ========== USERS ========== */

    await axios.post(
      `${BASE_URL}/api/users/follow`,
      { followingId: idB },
      authHeader(tokenA)
    );

    await axios.get(`${BASE_URL}/api/users/following`, authHeader(tokenA));
    await axios.get(`${BASE_URL}/api/users/followers`, authHeader(tokenB));
    await axios.get(`${BASE_URL}/api/users/stats`, authHeader(tokenA));
    await axios.get(
      `${BASE_URL}/api/users/search?q=userB`,
      authHeader(tokenA)
    );

    console.log("✅ Users endpoints verified");

    /* ========== POSTS ========== */

    const postRes = await axios.post(
      `${BASE_URL}/api/posts`,
      {
        content: "Hello from User B",
        media_url: "http://www.google.com",
        comments_enabled: true
      },
      authHeader(tokenB)
    );

    const postId = postRes.data.post.id;

    await sleep(300);

    const feedRes = await axios.get(
      `${BASE_URL}/api/posts/feed`,
      authHeader(tokenA)
    );

    if (!feedRes.data.feed.some(p => p.id === postId)) {
      throw new Error("Feed verification failed");
    }

    console.log("✅ Posts verified");

    /* ========== LIKES ========== */

    await axios.post(
      `${BASE_URL}/api/likes`,
      { post_id: postId },
      authHeader(tokenA)
    );

    await sleep(200);

    const likesRes = await axios.get(
      `${BASE_URL}/api/likes/post/${postId}`,
      authHeader(tokenA)
    );

    if (!likesRes.data.likes.some(u => u.id === idA)) {
      throw new Error("Like verification failed");
    }

    console.log("✅ Likes verified");

    /* ========== COMMENTS ========== */

    const commentRes = await axios.post(
      `${BASE_URL}/api/comments`,
      { post_id: postId, content: "Nice post!" },
      authHeader(tokenA)
    );

    const commentId = commentRes.data.comment.id;

    await axios.put(
      `${BASE_URL}/api/comments/${commentId}`,
      { content: "Updated comment" },
      authHeader(tokenA)
    );

    const commentsRes = await axios.get(
      `${BASE_URL}/api/comments/post/${postId}`,
      authHeader(tokenA)
    );

    if (!commentsRes.data.comments.some(c => c.id === commentId)) {
      throw new Error("Comment verification failed");
    }

    console.log("🎉 ALL ENDPOINTS VERIFIED SUCCESSFULLY");

  } catch (err) {
    console.error(
      "❌ Verification failed:",
      err.response?.data || err.message
    );
    process.exit(1);
  }
})();
