import { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Loader from '../components/Loader'
import '../styles/Admin.css'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'user'
  })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [removingId, setRemovingId] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/admin/users')
      setUsers(res.data.users || res.data || [])
    } catch (err) {
      setError('Could not load users.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value })
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      await api.post('/admin/users', newUser)
      setNewUser({ name: '', email: '', mobile: '', password: '', role: 'user' })
      fetchUsers()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not add user.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveUser = async (id) => {
    if (!window.confirm('Remove this user? This cannot be undone.')) return
    setRemovingId(id)
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      setError('Could not remove user.')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="app-page">
      <Navbar />
      <div className="container fade-in">
        <h1>Admin Dashboard</h1>
        <p className="page-subtitle">Manage all registered users.</p>

        <div className="stats-row">
          <div className="card stat-card">
            <p className="stat-number">{users.length}</p>
            <p className="stat-label">Total users</p>
          </div>
          <div className="card stat-card">
            <p className="stat-number">
              {users.filter((u) => u.role === 'admin').length}
            </p>
            <p className="stat-label">Admins</p>
          </div>
          <div className="card stat-card">
            <p className="stat-number">
              {users.filter((u) => u.role !== 'admin').length}
            </p>
            <p className="stat-label">Regular users</p>
          </div>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <h2>Add a new user</h2>
          <form className="add-user-form" onSubmit={handleAddUser}>
            <input
              name="name"
              placeholder="Full name"
              value={newUser.name}
              onChange={handleChange}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={handleChange}
              required
            />
            <input
              name="mobile"
              placeholder="Mobile number"
              value={newUser.mobile}
              onChange={handleChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Temporary password"
              value={newUser.password}
              onChange={handleChange}
              required
            />
            <select name="role" value={newUser.role} onChange={handleChange}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add user'}
            </button>
          </form>
          {formError && <p className="error-text">{formError}</p>}
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <h2>All users</h2>

          {loading && <Loader fullScreen={false} text="Loading users..." />}
          {!loading && error && <p className="error-text">{error}</p>}

          {!loading && !error && (
            <div className="table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Role</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="fade-in">
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.mobile}</td>
                      <td>
                        <span className={`role-badge role-${u.role}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleRemoveUser(u.id)}
                          disabled={removingId === u.id}
                        >
                          {removingId === u.id ? 'Removing...' : 'Remove'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <p className="page-subtitle">No users found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
