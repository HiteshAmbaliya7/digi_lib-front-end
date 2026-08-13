import { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import api from '../api/axios'

const AuthContext = createContext(null)

// 7 days matches a typical JWT expiry. Change this to match your backend.
const COOKIE_EXPIRY_DAYS = 7

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // { name, email, role }
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        // Expect backend JWT payload to include: name, email, role, exp
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          // token expired
          Cookies.remove('token')
          Cookies.remove('role')
        } else {
          setUser({
            name: decoded.name,
            email: decoded.email,
            role: decoded.role
          })
        }
      } catch (err) {
        Cookies.remove('token')
        Cookies.remove('role')
      }
    }
    setLoading(false)
  }, [])

  const saveSession = (token) => {
    Cookies.set('token', token, {
      expires: COOKIE_EXPIRY_DAYS,
      sameSite: 'strict'
    })
    const decoded = jwtDecode(token)
    Cookies.set('role', decoded.role, {
      expires: COOKIE_EXPIRY_DAYS,
      sameSite: 'strict'
    })
    setUser({
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    })
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/me')
        setUser(res.data.user || res.data)
      } catch (err) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    saveSession(res.data.token)
    return res.data
  }

  const signup = async (name, email, mobile, password) => {
    const res = await api.post('/auth/signup', {
      name,
      email,
      mobile,
      password
    })
    saveSession(res.data.token)
    return res.data
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.error('Logout error:', err)
    }
    Cookies.remove('token')
    Cookies.remove('role')
    setUser(null)
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    signup,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
