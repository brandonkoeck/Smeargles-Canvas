import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function CreatePost() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate that title is not empty
    if (!formData.title.trim()) {
      setError('Post title is required')
      setLoading(false)
      return
    }

    try {
      const { data, error: supabaseError } = await supabase
        .from('posts')
        .insert([
          {
            title: formData.title,
            content: formData.content,
            image_url: formData.image_url,
            upvotes: 0,
          }
        ])
        .select()

      if (supabaseError) {
        setError(supabaseError.message)
        setLoading(false)
        return
      }

      // Navigate to home page after successful creation
      navigate('/')
    } catch (err) {
      setError('Failed to create post: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="create-post-container">
      <h1>Create a New Post</h1>
      
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="form-group">
          <label htmlFor="title">Post Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter post title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter post content (optional)"
            rows="6"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="image_url">Image URL</label>
          <input
            type="text"
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="Enter image URL (optional)"
          />
        </div>

        <div className="form-buttons">
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Post'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/')}
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
