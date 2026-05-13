/**
 * DOKUSHO-ZUKI Backend API Implementation Skeleton
 * 
 * This file contains skeleton code for the backend API endpoints.
 * To be implemented using Node.js/Express, Python/Flask, or similar framework.
 */

// ============================================================================
// EXAMPLE: Node.js/Express Implementation
// ============================================================================

const express = require('express');
const app = express();
const db = require('./database');
const auth = require('./middleware/auth');

// Middleware
app.use(express.json());
app.use(auth.verifyToken);

// ============================================================================
// READING HISTORY ENDPOINTS
// ============================================================================

/**
 * POST /api/v1/history
 * Save or update reading history
 */
app.post('/api/v1/history', async (req, res) => {
  try {
    const { userId, mangaId, title, chapter, page, timestamp } = req.body;
    
    // Validate input
    if (!userId || !mangaId) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
        code: 'INVALID_INPUT'
      });
    }
    
    // Check if entry exists
    const existingEntry = await db.query(
      'SELECT * FROM reading_history WHERE user_id = ? AND manga_id = ?',
      [userId, mangaId]
    );
    
    let result;
    if (existingEntry.length > 0) {
      // Update existing entry
      result = await db.query(
        `UPDATE reading_history 
         SET chapter = ?, page = ?, timestamp = ?, last_updated = NOW()
         WHERE user_id = ? AND manga_id = ?`,
        [chapter, page, timestamp, userId, mangaId]
      );
    } else {
      // Insert new entry
      const historyId = generateId();
      result = await db.query(
        `INSERT INTO reading_history 
         (history_id, user_id, manga_id, title, chapter, page, timestamp, last_updated)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [historyId, userId, mangaId, title, chapter, page, timestamp]
      );
    }
    
    res.json({
      status: 'success',
      message: 'Reading history updated',
      data: {
        userId,
        mangaId,
        chapter,
        page,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error saving reading history:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/v1/history/:userId
 * Get user's reading history
 */
app.get('/api/v1/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0, sortBy = 'lastRead' } = req.query;
    
    // Validate limit
    const parsedLimit = Math.min(parseInt(limit), 100);
    const parsedOffset = parseInt(offset);
    
    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM reading_history WHERE user_id = ?',
      [userId]
    );
    
    // Get paginated history
    const orderBy = sortBy === 'chapter' ? 'chapter DESC' : 'last_updated DESC';
    const history = await db.query(
      `SELECT * FROM reading_history 
       WHERE user_id = ? 
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [userId, parsedLimit, parsedOffset]
    );
    
    res.json({
      status: 'success',
      data: {
        total: countResult[0].total,
        limit: parsedLimit,
        offset: parsedOffset,
        history: history
      }
    });
  } catch (error) {
    console.error('Error fetching reading history:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/v1/history/:userId/continue
 * Get continue reading data
 */
app.get('/api/v1/history/:userId/continue', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;
    
    const continueReading = await db.query(
      `SELECT manga_id, title, chapter, page, last_updated as lastRead
       FROM reading_history 
       WHERE user_id = ? 
       ORDER BY last_updated DESC
       LIMIT ?`,
      [userId, Math.min(parseInt(limit), 20)]
    );
    
    res.json({
      status: 'success',
      data: {
        continueReading: continueReading.map(item => ({
          ...item,
          continueUrl: `/read/${item.manga_id}?ch=${item.chapter}&page=${item.page}`
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching continue reading:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * DELETE /api/v1/history/:userId/:mangaId
 * Delete reading history for specific manga
 */
app.delete('/api/v1/history/:userId/:mangaId', async (req, res) => {
  try {
    const { userId, mangaId } = req.params;
    
    await db.query(
      'DELETE FROM reading_history WHERE user_id = ? AND manga_id = ?',
      [userId, mangaId]
    );
    
    res.json({
      status: 'success',
      message: 'Reading history entry deleted',
      data: {
        mangaId,
        deletedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error deleting reading history:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

// ============================================================================
// FORUM ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/forums/posts
 * Get forum posts with filtering
 */
app.get('/api/v1/forums/posts', async (req, res) => {
  try {
    const { topic, limit = 20, offset = 0, sortBy = 'newest', search } = req.query;
    
    const parsedLimit = Math.min(parseInt(limit), 100);
    const parsedOffset = parseInt(offset);
    
    let query = 'SELECT * FROM forum_posts WHERE is_deleted = FALSE';
    let params = [];
    
    // Add topic filter
    if (topic) {
      query += ' AND topic_id = ?';
      params.push(topic);
    }
    
    // Add search
    if (search) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // Add sorting
    const sortMap = {
      'newest': 'created_at DESC',
      'popular': 'likes DESC',
      'commented': 'replies DESC'
    };
    query += ` ORDER BY ${sortMap[sortBy] || sortMap['newest']}`;
    
    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(parsedLimit, parsedOffset);
    
    const posts = await db.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM forum_posts WHERE is_deleted = FALSE';
    let countParams = [];
    if (topic) {
      countQuery += ' AND topic_id = ?';
      countParams.push(topic);
    }
    if (search) {
      countQuery += ' AND (title LIKE ? OR content LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    const countResult = await db.query(countQuery, countParams);
    
    res.json({
      status: 'success',
      data: {
        total: countResult[0].total,
        limit: parsedLimit,
        offset: parsedOffset,
        posts: posts
      }
    });
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/v1/forums/posts/:postId
 * Get specific forum post with replies
 */
app.get('/api/v1/forums/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { includeReplies = true, limitReplies = 20 } = req.query;
    
    // Get post
    const postResult = await db.query(
      'SELECT * FROM forum_posts WHERE post_id = ? AND is_deleted = FALSE',
      [postId]
    );
    
    if (postResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found',
        code: 'NOT_FOUND'
      });
    }
    
    const post = postResult[0];
    
    // Increment view count
    await db.query(
      'UPDATE forum_posts SET views = views + 1 WHERE post_id = ?',
      [postId]
    );
    
    // Get replies if requested
    let replies = [];
    if (includeReplies) {
      replies = await db.query(
        `SELECT * FROM forum_replies 
         WHERE post_id = ? AND is_deleted = FALSE
         ORDER BY created_at DESC
         LIMIT ?`,
        [postId, Math.min(parseInt(limitReplies), 100)]
      );
    }
    
    res.json({
      status: 'success',
      data: {
        ...post,
        replies: replies,
        views: post.views + 1
      }
    });
  } catch (error) {
    console.error('Error fetching forum post:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/v1/forums/posts
 * Create new forum post
 */
app.post('/api/v1/forums/posts', auth.requireLogin, async (req, res) => {
  try {
    const { title, content, topic, tags } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!title || !content || !topic) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
        code: 'INVALID_INPUT'
      });
    }
    
    // Create post
    const postId = generateId();
    await db.query(
      `INSERT INTO forum_posts 
       (post_id, user_id, title, content, topic_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [postId, userId, title, content, topic]
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Post created successfully',
      data: {
        postId,
        title,
        topic,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating forum post:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/v1/forums/posts/:postId/replies
 * Add reply to forum post
 */
app.post('/api/v1/forums/posts/:postId/replies', auth.requireLogin, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!content) {
      return res.status(400).json({
        status: 'error',
        message: 'Content is required',
        code: 'INVALID_INPUT'
      });
    }
    
    // Check if post exists
    const postCheck = await db.query(
      'SELECT * FROM forum_posts WHERE post_id = ?',
      [postId]
    );
    
    if (postCheck.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found',
        code: 'NOT_FOUND'
      });
    }
    
    // Create reply
    const replyId = generateId();
    await db.query(
      `INSERT INTO forum_replies 
       (reply_id, post_id, user_id, content, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [replyId, postId, userId, content]
    );
    
    // Update reply count
    await db.query(
      'UPDATE forum_posts SET replies = replies + 1 WHERE post_id = ?',
      [postId]
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Reply created successfully',
      data: {
        replyId,
        postId,
        content,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating forum reply:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/v1/forums/posts/:postId/like
 * Like/unlike forum post
 */
app.post('/api/v1/forums/posts/:postId/like', auth.requireLogin, async (req, res) => {
  try {
    const { postId } = req.params;
    const { action = 'like' } = req.body;
    const userId = req.user.id;
    
    // Check if user already liked
    const likeCheck = await db.query(
      `SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?`,
      [postId, userId]
    );
    
    if (action === 'like') {
      if (likeCheck.length > 0) {
        return res.status(409).json({
          status: 'error',
          message: 'Already liked',
          code: 'CONFLICT'
        });
      }
      
      // Add like
      await db.query(
        `INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)`,
        [postId, userId]
      );
      
      // Increment likes
      await db.query(
        `UPDATE forum_posts SET likes = likes + 1 WHERE post_id = ?`,
        [postId]
      );
    } else if (action === 'unlike') {
      if (likeCheck.length === 0) {
        return res.status(409).json({
          status: 'error',
          message: 'Not liked yet',
          code: 'CONFLICT'
        });
      }
      
      // Remove like
      await db.query(
        `DELETE FROM post_likes WHERE post_id = ? AND user_id = ?`,
        [postId, userId]
      );
      
      // Decrement likes
      await db.query(
        `UPDATE forum_posts SET likes = likes - 1 WHERE post_id = ?`,
        [postId]
      );
    }
    
    // Get updated likes
    const result = await db.query(
      'SELECT likes FROM forum_posts WHERE post_id = ?',
      [postId]
    );
    
    res.json({
      status: 'success',
      message: `Post ${action}d`,
      data: {
        postId,
        liked: action === 'like',
        likes: result[0].likes
      }
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/v1/forums/topics
 * Get available forum topics
 */
app.get('/api/v1/forums/topics', async (req, res) => {
  try {
    const topics = await db.query(
      `SELECT topic_id, COUNT(*) as postCount, MAX(created_at) as recentActivity
       FROM forum_posts 
       WHERE is_deleted = FALSE
       GROUP BY topic_id
       ORDER BY postCount DESC`
    );
    
    const topicMetadata = {
      shonen: { name: 'Shōnen', description: 'Action-driven stories for young male readers', icon: 'fa-star' },
      shojo: { name: 'Shōjo', description: 'Romance and emotion for young female readers', icon: 'fa-heart' },
      seinen: { name: 'Seinen', description: 'More mature themes for adult male readers', icon: 'fa-users' },
      josei: { name: 'Josei', description: 'Complex storytelling for adult female readers', icon: 'fa-sparkles' },
      announcements: { name: 'Announcements', description: 'Platform updates and news', icon: 'fa-bullhorn' },
      fanart: { name: 'Fanart', description: 'Share your creative artwork', icon: 'fa-palette' },
      recommendations: { name: 'Recommendations', description: 'Suggest and discover manga', icon: 'fa-thumbs-up' }
    };
    
    const enrichedTopics = topics.map(topic => ({
      topicId: topic.topic_id,
      ...topicMetadata[topic.topic_id],
      postCount: topic.postCount,
      recentActivity: topic.recentActivity
    }));
    
    res.json({
      status: 'success',
      data: {
        topics: enrichedTopics
      }
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate unique ID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    code: 'SERVER_ERROR'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`DOKUSHO-ZUKI API running on port ${PORT}`);
});

module.exports = app;
