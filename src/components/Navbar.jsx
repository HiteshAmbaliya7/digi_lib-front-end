import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Navbar.css'

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Study Helper
      </Link>
      <div className="navbar-links">
        <span className="navbar-user">
          {user?.name} <span className="navbar-role">({user?.role})</span>
        </span>
        {isAdmin && (
          <Link to="/admin" className="navbar-link">
            Admin Dashboard
          </Link>
        )}
        <Link to="/" className="navbar-link">
          Home
        </Link>
        <button className="navbar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}
