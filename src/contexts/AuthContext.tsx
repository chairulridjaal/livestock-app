import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../lib/firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  setUser: React.Dispatch<React.SetStateAction<User | null>>  // Added setUser
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      throw new Error('Error logging in')
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      throw new Error('Error logging out')
    }
  }

  const signup = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (error) {
      throw new Error('Error signing up')
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}