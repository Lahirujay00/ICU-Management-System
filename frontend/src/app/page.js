'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Dashboard from '@/components/Dashboard'
import LoginForm from '@/components/auth/LoginForm'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Show loading spinner while checking session
  if (status === 'loading' || isLoading) {
    return <LoadingSpinner />
  }

  // If not authenticated, show login form
  if (!session) {
    return <LoginForm />
  }

  // If authenticated, show the main dashboard
  return <Dashboard />
}

