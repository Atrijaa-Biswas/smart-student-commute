import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'

export default function GoogleAuth({ className = 'btn-primary' }) {
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const signInWithGoogle = async () => {
    try {
      await loginWithGoogle()
      navigate('/dashboard')
    } catch (error) {
      console.error('Google auth error:', error)
      alert(`Google sign-in failed: ${error.message}`)
    }
  }

  return (
    <button 
      onClick={signInWithGoogle}
      className={`flex items-center justify-center space-x-3 px-6 py-3 rounded-2xl font-semibold transition-all hover:shadow-xl ${className}`}
    >
      <div className="w-5 h-5 bg-[url('https://developers.google.com/identity/images/g-logo.png')] bg-no-repeat bg-center bg-contain" />
      <span>Continue with Google</span>
      <ArrowRightIcon className="w-5 h-5" />
    </button>
  )
}

