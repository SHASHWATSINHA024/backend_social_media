const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLList,
    GraphQLSchema,
    GraphQLNonNull,
} = require("graphql");

const { pool, query } = require("../utils/database");
const { generateToken } = require("../utils/jwt");
const bcrypt = require("bcryptjs");

// Type Definitions
const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: GraphQLInt },
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        full_name: { type: GraphQLString },
        created_at: { type: GraphQLString },
    }),
});

const PostType = new GraphQLObjectType({
    name: "Post",
    fields: () => ({
        id: { type: GraphQLInt },
        user_id: { type: GraphQLInt },
        content: { type: GraphQLString },
        media_url: { type: GraphQLString },
        comments_enabled: { type: GraphQLBoolean },
        scheduled_at: { type: GraphQLString },
        is_published: { type: GraphQLBoolean },
        created_at: { type: GraphQLString },
        author: {
            type: UserType,
            resolve: async (post) => {
                const res = await query("SELECT * FROM users WHERE id = $1", [post.user_id]);
                return res.rows[0];
            }
        },
        likes_count: {
            type: GraphQLInt,
            resolve: async (post) => {
                const res = await query("SELECT COUNT(*) FROM likes WHERE post_id = $1", [post.id]);
                return parseInt(res.rows[0].count);
            }
        },
        comments: {
            type: new GraphQLList(CommentType),
            resolve: async (post) => {
                const res = await query("SELECT * FROM comments WHERE post_id = $1 AND is_deleted = false", [post.id]);
                return res.rows;
            }
        }
    }),
});

const CommentType = new GraphQLObjectType({
    name: "Comment",
    fields: () => ({
        id: { type: GraphQLInt },
        user_id: { type: GraphQLInt },
        post_id: { type: GraphQLInt },
        content: { type: GraphQLString },
        created_at: { type: GraphQLString },
        author: {
            type: UserType,
            resolve: async (comment) => {
                const res = await query("SELECT * FROM users WHERE id = $1", [comment.user_id]);
                return res.rows[0];
            }
        }
    })
});

const AuthType = new GraphQLObjectType({
    name: "Auth",
    fields: () => ({
        token: { type: GraphQLString },
        user: { type: UserType }
    })
});

// Root Query
const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        me: {
            type: UserType,
            resolve: (parent, args, context) => {
                if (!context.user) throw new Error("Unauthenticated");
                return context.user;
            }
        },
        feed: {
            type: new GraphQLList(PostType),
            resolve: async (parent, args, context) => {
                if (!context.user) throw new Error("Unauthenticated");
                const userId = context.user.id;
                const res = await query(
                    `SELECT p.* 
                 FROM posts p 
                 WHERE (p.user_id = $1 OR p.user_id IN (SELECT following_id FROM follows WHERE follower_id = $1))
                 AND p.is_deleted = false AND p.is_published = true
                 ORDER BY p.created_at DESC LIMIT 50`,
                    [userId]
                );
                return res.rows;
            }
        },
        post: {
            type: PostType,
            args: { id: { type: GraphQLInt } },
            resolve: async (parent, args) => {
                const res = await query("SELECT * FROM posts WHERE id = $1 AND is_deleted = false", [args.id]);
                return res.rows[0];
            }
        }
    },
});

// Mutation
const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        login: {
            type: AuthType,
            args: {
                username: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: async (parent, args) => {
                const res = await query("SELECT * FROM users WHERE username = $1", [args.username]);
                const user = res.rows[0];
                if (!user) throw new Error("User not found");
                const valid = await bcrypt.compare(args.password, user.password_hash);
                if (!valid) throw new Error("Invalid password");
                const token = generateToken({ userId: user.id, username: user.username });
                return { token, user };
            }
        },
        createPost: {
            type: PostType,
            args: {
                content: { type: new GraphQLNonNull(GraphQLString) },
                media_url: { type: GraphQLString },
                scheduled_at: { type: GraphQLString }
            },
            resolve: async (parent, args, context) => {
                if (!context.user) throw new Error("Unauthenticated");
                const is_published = !args.scheduled_at;
                const res = await query(
                    `INSERT INTO posts (user_id, content, media_url, scheduled_at, is_published, created_at)
                 VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
                    [context.user.id, args.content, args.media_url, args.scheduled_at, is_published]
                );
                return res.rows[0];
            }
        }
    },
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
});
