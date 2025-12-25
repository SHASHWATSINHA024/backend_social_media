# Social Media Backend API

## Authentication
- `POST /api/auth/register` - { username, email, password, full_name }
- `POST /api/auth/login` - { username, password }

## Users
- `POST /api/users/follow` - { followingId } (Auth Required)
- `POST /api/users/unfollow` - { followingId } (Auth Required)
- `GET /api/users/following` (Auth Required)
- `GET /api/users/followers` (Auth Required)
- `GET /api/users/stats` (Auth Required)
- `GET /api/users/search?q=query` (Auth Required)

## Posts
- `POST /api/posts` - { content, media_url, comments_enabled } (Auth Required)
- `GET /api/posts/feed` - Get personalized feed (Auth Required)
- `GET /api/posts/:post_id`
- `GET /api/posts/user/:user_id`
- `DELETE /api/posts/:post_id` (Auth Required)

## Likes
- `POST /api/likes` - { post_id } (Auth Required)
- `DELETE /api/likes/:post_id` (Auth Required)
- `GET /api/likes/post/:post_id`
- `GET /api/likes/user/:user_id`

## Comments
- `POST /api/comments` - { post_id, content } (Auth Required)
- `PUT /api/comments/:comment_id` - { content } (Auth Required)
- `DELETE /api/comments/:comment_id` (Auth Required)
- `GET /api/comments/post/:post_id`

## Bonus Features

### Scheduled Posts
To schedule a post, include `scheduled_at` in the `POST /api/posts` body:
- `scheduled_at`: ISO 8601 formatted date string (e.g., `2025-12-25T15:00:00Z`).
- The post will remain unpublished (`is_published: false`) until the scheduled time.
- A background scheduler checks every minute to publish due posts.

### GraphQL API
The API is available via GraphQL at `/graphql`.
- **GraphiQL Interface**: Visit `http://localhost:3000/graphql` in your browser to explore the schema and run queries.
- **Example Query**:
  ```graphql
  query {
    me { username }
    feed { content author { username } }
  }
  ```

### Deployment
- **Docker**: A `Dockerfile` is provided to containerize the application.
- **Localtunnel**: Run stored script `./deployment_script.sh` to expose your local server to the internet.
  - Current URL: `https://plenty-deer-ask.loca.lt` (Temporary)
