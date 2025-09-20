import { useState, useEffect } from 'react'
import { authenticate, unauthenticate, getCurrentUser, createSubscription } from '../lib/flow'

export default function Home() {
  const [user, setUser] = useState(null)
  const [subscriptionPlan, setSubscriptionPlan] = useState('basic')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Subscribe to user changes
    const unsubscribe = getCurrentUser().subscribe(setUser)
    return () => unsubscribe()
  }, [])

  const handleLogin = async () => {
    try {
      await authenticate()
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await unauthenticate()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleCreateSubscription = async () => {
    if (!user?.loggedIn) {
      alert('Please login first')
      return
    }

    setLoading(true)
    try {
      const plans = {
        basic: { amount: 10.0, interval: 2592000 }, // 30 days
        premium: { amount: 25.0, interval: 2592000 },
        enterprise: { amount: 50.0, interval: 2592000 }
      }

      const plan = plans[subscriptionPlan]
      const txId = await createSubscription(subscriptionPlan, plan.amount, plan.interval)
      
      alert(`Subscription created! Transaction ID: ${txId}`)
    } catch (error) {
      console.error('Subscription creation failed:', error)
      alert('Failed to create subscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Floowscription 🌊
          </h1>
          <p className="text-xl text-gray-600">
            Smart Subscription Manager on Flow Blockchain
          </p>
        </header>

        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          {!user?.loggedIn ? (
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Welcome!</h2>
              <p className="text-gray-600 mb-6">
                Connect your Flow wallet to start managing subscriptions
              </p>
              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold mb-2">
                  Welcome back!
                </h2>
                <p className="text-gray-600 text-sm">
                  {user.addr}
                </p>
                <button
                  onClick={handleLogout}
                  className="text-red-600 text-sm hover:underline mt-2"
                >
                  Logout
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Subscription Plan
                  </label>
                  <select
                    value={subscriptionPlan}
                    onChange={(e) => setSubscriptionPlan(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="basic">Basic - 10 FLOW/month</option>
                    <option value="premium">Premium - 25 FLOW/month</option>
                    <option value="enterprise">Enterprise - 50 FLOW/month</option>
                  </select>
                </div>

                <button
                  onClick={handleCreateSubscription}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Subscription'}
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="text-center mt-12 text-gray-500">
          <p>Built on Flow Blockchain | ReWTF Program Participant</p>
        </footer>
      </div>
    </div>
  )
}