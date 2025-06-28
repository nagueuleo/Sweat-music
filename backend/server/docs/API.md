# Spotify Clone API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "User registered successfully.",
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "role": "user"
  },
  "token": "string"
}
```

#### POST /auth/login
Login user.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Login successful.",
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "role": "user"
  },
  "token": "string"
}
```

#### GET /auth/me
Get current user profile. (Protected)

**Response:**
```json
{
  "_id": "string",
  "username": "string",
  "email": "string",
  "role": "user",
  "followers": [],
  "following": [],
  "playlists": []
}
```

### Music

#### GET /music/songs
Get all songs with pagination. (Protected)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "songs": [
    {
      "_id": "string",
      "title": "string",
      "artist": "string",
      "album": "string",
      "duration": 200,
      "audioUrl": "string",
      "imageUrl": "string",
      "genre": "Pop",
      "playCount": 1000,
      "likes": 50
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 5
}
```

#### GET /music/search
Search songs and albums. (Protected)

**Query Parameters:**
- `q`: Search query
- `genre` (optional): Filter by genre

**Response:**
```json
{
  "songs": [],
  "albums": []
}
```

#### POST /music/songs/:id/like
Like a song. (Protected)

#### DELETE /music/songs/:id/like
Unlike a song. (Protected)

#### GET /music/liked-songs
Get user's liked songs. (Protected)

#### POST /music/play
Record song play. (Protected)

**Request Body:**
```json
{
  "songId": "string"
}
```

#### GET /music/history
Get user's play history. (Protected)

#### GET /music/recommendations
Get personalized recommendations. (Protected)

#### GET /music/export-stats
Export listening statistics as CSV. (Protected)

### Playlists

#### GET /playlists/user
Get user's playlists. (Protected)

#### GET /playlists/:id
Get playlist by ID. (Protected)

#### POST /playlists
Create new playlist. (Protected)

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "isPublic": false
}
```

#### PUT /playlists/:id
Update playlist. (Protected)

#### DELETE /playlists/:id
Delete playlist. (Protected)

#### POST /playlists/:id/songs
Add song to playlist. (Protected)

**Request Body:**
```json
{
  "songId": "string"
}
```

#### DELETE /playlists/:id/songs/:songId
Remove song from playlist. (Protected)

### Users

#### GET /users/:id
Get user profile. (Protected)

#### PUT /users/profile
Update user profile. (Protected)

#### POST /users/:id/follow
Follow user. (Protected)

#### DELETE /users/:id/unfollow
Unfollow user. (Protected)

#### GET /users/search
Search users. (Protected)

**Query Parameters:**
- `q`: Search query

### Admin (Admin Only)

#### GET /admin/stats
Get platform statistics. (Admin)

#### POST /admin/songs
Create new song. (Admin)

**Form Data:**
- `title`: string
- `artist`: string
- `album`: string
- `duration`: number
- `genre`: string
- `audio`: file
- `image`: file (optional)

#### PUT /admin/songs/:id
Update song. (Admin)

#### DELETE /admin/songs/:id
Delete song. (Admin)

#### POST /admin/albums
Create new album. (Admin)

#### PUT /admin/albums/:id
Update album. (Admin)

#### DELETE /admin/albums/:id
Delete album. (Admin)

#### GET /admin/users
Get all users. (Admin)

#### POST /admin/users/:id/block
Block user. (Admin)

#### POST /admin/users/:id/unblock
Unblock user. (Admin)

#### POST /admin/users/:id/promote
Promote user to admin. (Admin)

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "message": "Error description"
}
```

**401 Unauthorized:**
```json
{
  "message": "Access denied. No token provided."
}
```

**403 Forbidden:**
```json
{
  "message": "Access denied. Admin rights required."
}
```

**404 Not Found:**
```json
{
  "message": "Resource not found."
}
```

**500 Internal Server Error:**
```json
{
  "message": "Internal Server Error"
}
```