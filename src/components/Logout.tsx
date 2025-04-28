// src/components/Logout.tsx

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'

const Logout = () => {
  const { setUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const logoutUser = async () => {
      try {
        await signOut(auth)
        setUser(null)  // Reset user state after logging out
        navigate("/login")  // Redirect to login page
      } catch (error) {
        console.error("Error signing out: ", error)
      }
    }

    logoutUser()
  }, [setUser, navigate])

  return null
}

export default Logout
