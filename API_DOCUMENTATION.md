# DOKUSHO-ZUKI Backend API Documentation

## Overview
This document provides comprehensive API specifications for the DOKUSHO-ZUKI manga reading platform. The API handles user authentication, reading history tracking, and community forum management.

## Base URL
```
https://api.dokusho-zuki.com/v1
```

---

## 1. Reading History API

### 1.1 Save/Update Reading History
**Endpoint:** `POST /history`

**Description:** Save or update a user's reading progress for a specific manga.

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user123",
  "mangaId": "001",
  "title": "Kamisama Kiss",
  "chapter": 1,
  "page": 15,
  "timestamp": "2026-05-12T10:30:00Z"
}
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "Reading history updated",
  "data": {
    "historyId": "hist123",
    "userId": "user123",
    "mangaId": "001",
    "chapter": 1,
    "page": 15,
    "lastUpdated": "2026-05-12T10:30:00Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "status": "error",
  "message": "Invalid manga ID or user ID",
  "code": "INVALID_INPUT"
}
```

---

### 1.2 Get User's Reading History
**Endpoint:** `GET /history/:userId`

**Description:** Retrieve all reading history entries for a specific user.

**Request Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `sortBy` (optional): Sort field - "lastRead" | "chapter" | "title" (default: "lastRead")

**Response (Success - 200):**
```json
{
  "status": "success",
  "data": {
    "total": 15,
    "limit": 50,
    "offset": 0,
    "history": [
      {
        "historyId": "hist123",
        "mangaId": "001",
        "title": "Kamisama Kiss",
        "chapter": 1,
        "page": 15,
        "lastRead": "2026-05-12T10:30:00Z"
      },
      {
        "historyId": "hist124",
        "mangaId": "002",
        "title": "Soul Eater",
        "chapter": 15,
        "page": 30,
        "lastRead": "2026-05-11T14:20:00Z"
      }
    ]
  }
}
```

---

### 1.3 Get Continue Reading Data
**Endpoint:** `GET /history/:userId/continue`

**Description:** Get the most recent reading positions for quick continuation.

**Request Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` (optional): Number of recent items to return (default: 10)

**Response (Success - 200):**
```json
{
  "status": "success",
  "data": {
    "continueReading": [
      {
        "mangaId": "001",
        "title": "Kamisama Kiss",
        "chapter": 1,
        "page": 15,
        "continueUrl": "/read/001?ch=1&page=15",
        "lastRead": "2026-05-12T10:30:00Z"
      }
    ]
  }
}
```

---

### 1.4 Clear Reading History Entry
**Endpoint:** `DELETE /history/:userId/:mangaId`

**Description:** Delete reading history for a specific manga.

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "Reading history entry deleted",
  "data": {
    "mangaId": "001",
    "deletedAt": "2026-05-12T10:35:00Z"
  }
}
```

---

### 1.5 Clear All Reading History
**Endpoint:** `DELETE /history/:userId`

**Description:** Delete all reading history for a user.

**Request Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `confirm`: Must be "true" to confirm deletion

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "All reading history cleared",
  "data": {
    "entriesDeleted": 25,
    "clearedAt": "2026-05-12T10:35:00Z"
  }
}
```

---

## 2. Community Forums API

### 2.1 Get Forum Posts
**Endpoint:** `GET /forums/posts`

**Description:** Retrieve forum posts with optional filtering by topic.

**Query Parameters:**
- `topic` (optional): Filter by topic - "shonen" | "shojo" | "seinen" | "josei" | "announcements" | "fanart" | "recommendations"
- `limit` (optional): Number of posts to return (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `sortBy` (optional): Sort field - "newest" | "popular" | "commented" (default: "newest")
- `search` (optional): Search posts by title or content

**Response (Success - 200):**
```json
{
  "status": "success",
  "data": {
    "total": 342,
    "limit": 20,
    "offset": 0,
    "posts": [
      {
        "postId": "post123",
        "title": "Best Shōnen Recommendations",
        "author": {
          "userId": "user123",
          "username": "MangaFan",
          "avatar": "https://api.dokusho-zuki.com/avatars/user123.jpg"
        },
        "topic": "shonen",
        "content": "Looking for some great shōnen manga with amazing action sequences...",
        "createdAt": "2026-05-12T10:30:00Z",
        "updatedAt": "2026-05-12T10:30:00Z",
        "replies": 12,
        "likes": 45,
        "views": 234
      }
    ]
  }
}
```

---

### 2.2 Get Post Details
**Endpoint:** `GET /forums/posts/:postId`

**Description:** Retrieve a specific forum post with all replies.

**Query Parameters:**
- `includeReplies` (optional): Include reply threads (default: true)
- `limitReplies` (optional): Number of replies to return (default: 20)

**Response (Success - 200):**
```json
{
  "status": "success",
  "data": {
    "postId": "post123",
    "title": "Best Shōnen Recommendations",
    "author": {
      "userId": "user123",
      "username": "MangaFan",
      "avatar": "https://api.dokusho-zuki.com/avatars/user123.jpg"
    },
    "topic": "shonen",
    "content": "Looking for some great shōnen manga with amazing action sequences. What are your top picks?",
    "createdAt": "2026-05-12T10:30:00Z",
    "updatedAt": "2026-05-12T10:30:00Z",
    "replies": [
      {
        "replyId": "reply456",
        "author": {
          "userId": "user456",
          "username": "AnimeNerd",
          "avatar": "https://api.dokusho-zuki.com/avatars/user456.jpg"
        },
        "content": "Attack on Titan is amazing! I'd also recommend Demon Slayer...",
        "createdAt": "2026-05-12T11:00:00Z",
        "likes": 23
      }
    ],
    "likes": 45,
    "views": 234
  }
}
```

---

### 2.3 Create Forum Post
**Endpoint:** `POST /forums/posts`

**Description:** Create a new forum post.

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Best Shōnen Recommendations",
  "content": "Looking for some great shōnen manga...",
  "topic": "shonen",
  "tags": ["action", "adventure", "recommendation"]
}
```

**Response (Success - 201):**
```json
{
  "status": "success",
  "message": "Post created successfully",
  "data": {
    "postId": "post123",
    "title": "Best Shōnen Recommendations",
    "author": {
      "userId": "user123",
      "username": "MangaFan"
    },
    "topic": "shonen",
    "createdAt": "2026-05-12T10:30:00Z"
  }
}
```

---

### 2.4 Create Forum Reply
**Endpoint:** `POST /forums/posts/:postId/replies`

**Description:** Add a reply to a forum post.

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Attack on Titan is amazing! I'd also recommend Demon Slayer..."
}
```

**Response (Success - 201):**
```json
{
  "status": "success",
  "message": "Reply created successfully",
  "data": {
    "replyId": "reply456",
    "postId": "post123",
    "author": {
      "userId": "user456",
      "username": "AnimeNerd"
    },
    "content": "Attack on Titan is amazing!...",
    "createdAt": "2026-05-12T11:00:00Z"
  }
}
```

---

### 2.5 Like/Unlike Post
**Endpoint:** `POST /forums/posts/:postId/like`

**Description:** Like or unlike a forum post.

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "action": "like"
}
```

**Query Parameters:**
- `action` (optional): "like" | "unlike" (default: "like")

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "Post liked",
  "data": {
    "postId": "post123",
    "liked": true,
    "likes": 46
  }
}
```

---

### 2.6 Get Forum Topics
**Endpoint:** `GET /forums/topics`

**Description:** Retrieve available forum topics and their statistics.

**Response (Success - 200):**
```json
{
  "status": "success",
  "data": {
    "topics": [
      {
        "topicId": "shonen",
        "name": "Shōnen",
        "description": "Action-driven stories for young male readers",
        "icon": "fa-star",
        "postCount": 850,
        "recentActivity": "2026-05-12T14:20:00Z"
      },
      {
        "topicId": "shojo",
        "name": "Shōjo",
        "description": "Romance and emotion for young female readers",
        "icon": "fa-heart",
        "postCount": 623,
        "recentActivity": "2026-05-12T13:45:00Z"
      }
    ]
  }
}
```

---

### 2.7 Moderate Forum Post
**Endpoint:** `DELETE /forums/posts/:postId`

**Description:** Delete/hide a forum post (admin only).

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Violates content policy"
}
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "Post removed",
  "data": {
    "postId": "post123",
    "removedAt": "2026-05-12T15:00:00Z",
    "reason": "Violates content policy"
  }
}
```

---

## 3. Database Schema

### 3.1 Reading History Table (SQL)
```sql
CREATE TABLE reading_history (
  history_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  manga_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  chapter INT,
  page INT,
  timestamp DATETIME,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (manga_id) REFERENCES manga(manga_id),
  INDEX idx_user_id (user_id),
  INDEX idx_manga_id (manga_id),
  INDEX idx_last_updated (last_updated)
);
```

### 3.2 Forum Posts Table (SQL)
```sql
CREATE TABLE forum_posts (
  post_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT NOT NULL,
  topic_id VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  INDEX idx_topic_id (topic_id),
  INDEX idx_created_at (created_at),
  INDEX idx_user_id (user_id)
);
```

### 3.3 Forum Replies Table (SQL)
```sql
CREATE TABLE forum_replies (
  reply_id VARCHAR(36) PRIMARY KEY,
  post_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  content LONGTEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  likes INT DEFAULT 0,
  FOREIGN KEY (post_id) REFERENCES forum_posts(post_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  INDEX idx_post_id (post_id),
  INDEX idx_user_id (user_id)
);
```

---

## 4. Error Codes

| Code | Status | Message | Description |
|------|--------|---------|-------------|
| INVALID_INPUT | 400 | Bad Request | Invalid request parameters |
| UNAUTHORIZED | 401 | Unauthorized | Missing or invalid authentication token |
| FORBIDDEN | 403 | Forbidden | User lacks permission for this action |
| NOT_FOUND | 404 | Not Found | Resource not found |
| CONFLICT | 409 | Conflict | Resource already exists |
| RATE_LIMITED | 429 | Too Many Requests | API rate limit exceeded |
| SERVER_ERROR | 500 | Internal Server Error | Server error occurred |

---

## 5. Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Tokens are obtained via the login endpoint and expire after 24 hours. Use refresh tokens to obtain new access tokens.

---

## 6. Rate Limiting

- **Requests per minute:** 60 for authenticated users, 20 for anonymous
- **Requests per hour:** 1000 for authenticated users, 200 for anonymous
- Rate limit headers are included in responses

---

## 7. Example Implementation

### Frontend (JavaScript)

```javascript
// Save reading progress
async function updateReadingProgress(mangaId, chapter, page) {
  const response = await fetch('https://api.dokusho-zuki.com/v1/history', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: currentUser.id,
      mangaId: mangaId,
      chapter: chapter,
      page: page,
      timestamp: new Date().toISOString()
    })
  });
  
  return await response.json();
}

// Get continue reading
async function getContinueReading() {
  const response = await fetch(`https://api.dokusho-zuki.com/v1/history/${currentUser.id}/continue`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

// Create forum post
async function createForumPost(title, content, topic) {
  const response = await fetch('https://api.dokusho-zuki.com/v1/forums/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: title,
      content: content,
      topic: topic
    })
  });
  
  return await response.json();
}
```

---

## 8. Changelog

### Version 1.0 (2026-05-12)
- Initial release
- Reading history endpoints
- Forum posts endpoints
- Forum replies endpoints
- Topic management endpoints
