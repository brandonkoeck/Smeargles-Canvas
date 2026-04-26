import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CreatePost from './pages/CreatePost'
import PostDetail from './pages/PostDetail'
import EditPost from './pages/EditPost'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/post/:id/edit" element={<EditPost />} />
      </Routes>
    </Router>
  )
}

export default App
