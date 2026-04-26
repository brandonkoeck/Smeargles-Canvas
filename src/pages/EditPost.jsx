import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function EditPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()

      if (supabaseError) {
        setError(supabaseError.message)
        setLoading(false)
        return
      }

      setFormData({
        title: data.title,
        content: data.content || '',
        image_url: data.image_url || '',
      })
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch post: ' + err.message)
      setLoading(false)
    }
  }

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
    setSaving(true)

    // Validate that title is not empty
    if (!formData.title.trim()) {
      setError('Post title is required')
      setSaving(false)
      return
    }

    try {
      const { error: supabaseError } = await supabase
        .from('posts')
        .update({
          title: formData.title,
          content: formData.content,
          image_url: formData.image_url,
        })
        .eq('id', id)

      if (supabaseError) {
        setError(supabaseError.message)
        setSaving(false)
        return
      }

      // Navigate back to post detail page
      navigate(`/post/${id}`)
    } catch (err) {
      setError('Failed to update post: ' + err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="loading">Loading post...</p>
  }

  return (
    <div className="create-post-container">
      <h1>Edit Post</h1>
      
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
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate(`/post/${id}`)}
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
