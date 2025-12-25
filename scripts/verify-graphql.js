const axios = require('axios');

const testGraphQL = async () => {
    const BASE_URL = 'http://localhost:3000/graphql';

    try {
        console.log("Testing GraphQL...");

        // 1. Login Mutation
        const loginQuery = `
            mutation {
                login(username: "usera_${Date.now()}", password: "password123") {
                    token
                    user { id username }
                }
            }
        `;
        // Since we need an existing user, let's register one via REST first or just assume one exists? 
        // Let's use the mutation if we updated it to register... schema only has Login.
        // I'll register via REST using axios first, then test GraphQL query.

        // Register temp user
        const regRes = await axios.post('http://localhost:3000/api/auth/register', {
            username: `gql${Date.now()}`,
            email: `gql${Date.now()}@test.com`,
            password: 'password123',
            full_name: 'GQL User'
        });
        const token = regRes.data.token;
        console.log("Registered user for GQL test.");

        // 2. Query Me
        const meQuery = `
            query {
                me {
                    id
                    username
                    full_name
                }
            }
        `;

        const meRes = await axios.post(BASE_URL, { query: meQuery }, {
            headers: { Authorization: token }
        });

        if (meRes.data.errors) {
            console.error("GQL Error:", meRes.data.errors);
        } else {
            console.log("✅ GraphQL Me Query Success:", meRes.data.data.me);
        }

        // 3. Create Post Mutation
        const postMutation = `
            mutation {
                createPost(content: "Hello from GraphQL!") {
                    id
                    content
                    is_published
                }
            }
        `;

        const postRes = await axios.post(BASE_URL, { query: postMutation }, {
            headers: { Authorization: token }
        });

        if (postRes.data.errors) {
            console.error("GQL Error:", postRes.data.errors);
        } else {
            console.log("✅ GraphQL Create Post Success:", postRes.data.data.createPost);
        }

    } catch (error) {
        console.error("GraphQL Test Failed:", error.response ? error.response.data : error.message);
    }
};

testGraphQL();
