import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import trainerImg from '../assets/trainer.webp'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPostAndComments()
  }, [id])

  const fetchPostAndComments = async () => {
    try {
      setLoading(true)

      // Fetch post
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()

      if (postError) {
        setError(postError.message)
        setLoading(false)
        return
      }

      setPost(postData)

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: true })

      if (commentsError) {
        console.error('Error fetching comments:', commentsError)
      } else {
        setComments(commentsData || [])
      }
    } catch (err) {
      setError('Failed to fetch post: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpvote = async () => {
    if (!post) return

    try {
      const { error: supabaseError } = await supabase
        .from('posts')
        .update({ upvotes: post.upvotes + 1 })
        .eq('id', id)

      if (supabaseError) {
        setError(supabaseError.message)
        return
      }

      // Update local state
      setPost({ ...post, upvotes: post.upvotes + 1 })
    } catch (err) {
      setError('Failed to upvote: ' + err.message)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()

    if (!newComment.trim()) {
      setError('Comment cannot be empty')
      return
    }

    try {
      const { data, error: supabaseError } = await supabase
        .from('comments')
        .insert([
          {
            post_id: id,
            content: newComment,
          }
        ])
        .select()

      if (supabaseError) {
        setError(supabaseError.message)
        return
      }

      // Add comment to local state
      setComments([...comments, data[0]])
      setNewComment('')
    } catch (err) {
      setError('Failed to add comment: ' + err.message)
    }
  }

  const handleDeletePost = async () => {
    if (!post) return

    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      const { error: supabaseError } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

      if (supabaseError) {
        setError(supabaseError.message)
        return
      }

      // Navigate back to home
      navigate('/')
    } catch (err) {
      setError('Failed to delete post: ' + err.message)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  if (loading) {
    return <p className="loading">Loading post...</p>
  }

  if (error) {
    return <p className="error-message">{error}</p>
  }

  if (!post) {
    return <p className="error-message">Post not found</p>
  }

  return (
    <div className="post-detail-container">
      <button onClick={() => navigate('/')} className="back-btn">← Back to Home</button>

      <div className="post-detail">
        <div className="post-header-with-author">
          <div className="post-author-info">
            <img src={trainerImg} alt="Trainer" className="post-author-pic" />
            <p className="post-author-name">Trainer</p>
          </div>
          <div className="post-header">
            <h1>{post.title}</h1>
            <p className="post-date">{formatDate(post.created_at)}</p>
          </div>
        </div>

        {post.image_url && (
          <img src={post.image_url} alt={post.title} className="post-image" />
        )}

        {post.content && (
          <p className="post-content">{post.content}</p>
        )}

        <div className="post-actions">
          <button onClick={handleUpvote} className="upvote-btn">
            👍 Upvote ({post.upvotes})
          </button>
          <button 
            onClick={() => navigate(`/post/${id}/edit`)} 
            className="edit-btn"
          >
            ✏️ Edit Post
          </button>
          <button onClick={handleDeletePost} className="delete-btn">
            🗑️ Delete Post
          </button>
        </div>
      </div>

      <div className="comments-section">
        <h2>Comments ({comments.length})</h2>

        <form onSubmit={handleAddComment} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows="3"
          ></textarea>
          <button type="submit">Post Comment</button>
        </form>

        {comments.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        ) : (
          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment">
                <img src={trainerImg} alt="Profile" className="comment-profile-pic" />
                <div className="comment-body">
                  <p className="comment-author">Trainer</p>
                  <p className="comment-content">{comment.content}</p>
                  <p className="comment-date">{formatDate(comment.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
