import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import smeargleImg from '../assets/smeargle.png'

export default function Home() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const { data, error: supabaseError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (supabaseError) {
        setError(supabaseError.message)
        return
      }

      // Fetch comment counts for each post
      const postsWithComments = await Promise.all(
        (data || []).map(async (post) => {
          const { count, error: countError } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id)

          return {
            ...post,
            commentCount: countError ? 0 : (count || 0),
          }
        })
      )

      setPosts(postsWithComments)
    } catch (err) {
      setError('Failed to fetch posts: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter posts by search term
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'created_at') {
      return new Date(b.created_at) - new Date(a.created_at)
    } else if (sortBy === 'upvotes') {
      return b.upvotes - a.upvotes
    }
    return 0
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  return (
    <div className="home-container">
      <div className="header">
        <div className="header-title">
          <img src={smeargleImg} alt="Smeargle" className="header-logo" />
          <h1>Smeargle's Canvas</h1>
        </div>
        <button onClick={() => navigate('/create')} className="create-btn">
          + New Post
        </button>
      </div>

      <div className="controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search posts by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="sort-controls">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="created_at">Creation Time (Newest First)</option>
            <option value="upvotes">Upvotes (Most First)</option>
          </select>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p className="loading">Loading posts...</p>
      ) : sortedPosts.length === 0 ? (
        <p className="no-posts">No posts found. {searchTerm && 'Try a different search.'}</p>
      ) : (
        <div className="posts-feed">
          {sortedPosts.map(post => (
            <div
              key={post.id}
              className="post-card"
              onClick={() => navigate(`/post/${post.id}`)}
              style={{ cursor: 'pointer' }}
            >
              {post.image_url && (
                <img src={post.image_url} alt={post.title} className="post-card-image" />
              )}
              <div className="post-card-content">
                <h2 className="post-card-title">{post.title}</h2>
                <div className="post-card-meta">
                  <span className="post-card-comments">Comments: {post.commentCount}</span>
                  <span className="post-card-upvotes">Upvotes: {post.upvotes}</span>
                  <span className="post-card-date">{formatDate(post.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
