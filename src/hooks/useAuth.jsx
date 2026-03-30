import { useState, useEffect, createContext, useContext } from 'react'
import { auth } from '../services/firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    user,
    loading,
    login: async (email, password) => await signInWithEmailAndPassword(auth, email, password),
    signup: async (email, password, displayName) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      if (displayName) {
        await updateProfile(userCredential.user, { displayName })
      }
      return userCredential
    },
    loginWithGoogle: async () => {
      const provider = new GoogleAuthProvider()
      return await signInWithPopup(auth, provider)
    },
    logout: async () => await signOut(auth),
  }

  if (loading) {
    // Defer rendering until auth state is resolved.
    // App handles the loading state in ProtectedRoute.
    return null
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

