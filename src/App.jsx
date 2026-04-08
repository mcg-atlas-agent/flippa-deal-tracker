import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import toast, { Toaster } from 'react-hot-toast'
import { FiDollarSign, FiTrendingUp, FiCheckCircle, FiXCircle, FiClock, FiCopy, FiExternalLink, FiThumbsUp, FiThumbsDown, FiMessageSquare, FiArrowRight } from 'react-icons/fi'

const supabase = createClient(
  'https://wjlvkixydrormnvxdrm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqbHZraXh5ZHJvcm1nbnZ4ZHJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODIyNDUsImV4cCI6MjA4ODE1ODI0NX0.A0dzsJPpQFDz0ZXUK6TWaG4bgu8PBW0x2txoqwbnXYg'
)

function App() {
  const navigate = useNavigate()
  const [deals, setDeals] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [feedbackText, setFeedbackText] = useState({})

  useEffect(() => {
    fetchDeals()
  }, [])

  async function fetchDeals() {
    setLoading(true)
    const { data, error } = await supabase
      .from('flippa_deals')
      .select('*')
      .order('monthly_profit', { ascending: false })
    
    if (error) {
      toast.error('Failed to load deals')
      console.error(error)
    } else {
      setDeals(data || [])
    }
    setLoading(false)
  }

  async function updateDealStatus(dealId, status) {
    const { error } = await supabase
      .from('flippa_deals')
      .update({ 
        status,
        nda_signed_date: status === 'nda_signed' ? new Date().toISOString() : undefined
      })
      .eq('deal_id', dealId)
    
    if (error) {
      toast.error('Failed to update deal')
    } else {
      toast.success(status === 'interested' ? '✅ Marked as Interested' : status === 'passed' ? '❌ Passed' : '✓ Updated')
      fetchDeals()
    }
  }

  async function provideFeedback(dealId, feedbackType, reason = '') {
    const { error } = await supabase
      .from('flippa_deals')
      .update({ 
        user_feedback: feedbackType, // 'interested' or 'passed'
        feedback_reason: reason || null,
        feedback_at: new Date().toISOString()
      })
      .eq('deal_id', dealId)
    
    if (error) {
      toast.error('Failed to save feedback')
      console.error(error)
    } else {
      toast.success(feedbackType === 'interested' ? '👍 Feedback saved: Interested' : '👎 Feedback saved: Passed')
      fetchDeals()
      setFeedbackText(prev => ({ ...prev, [dealId]: '' }))
    }
  }

  function copyMessage(deal) {
    const message = deal.seller_message || `Hi, I'm Ankur Mattoo with Mattoo Capital Group. I'm interested in your ${deal.business_name || 'business'} because of ${deal.notes || 'its strong financials'}. I've been on the lookout for ecommerce businesses like these in the $1M-$5M range. I've signed the NDA and would love to review your financials and P&L to better understand the opportunity.`
    
    navigator.clipboard.writeText(message)
    toast.success('📋 Message copied to clipboard!')
  }

  const filteredDeals = deals.filter(deal => {
    if (filter === 'interested') return deal.status === 'interested' || deal.user_feedback === 'interested'
    if (filter === 'passed') return deal.status === 'passed' || deal.user_feedback === 'passed'
    if (filter === 'pending') return !deal.user_feedback && deal.status !== 'interested' && deal.status !== 'passed'
    return true
  })

  const stats = {
    total: deals.length,
    totalValue: deals.reduce((sum, d) => sum + (d.asking_price || 0), 0),
    monthlyRevenue: deals.reduce((sum, d) => sum + (d.monthly_revenue || 0), 0),
    monthlyProfit: deals.reduce((sum, d) => sum + (d.monthly_profit || 0), 0),
    interested: deals.filter(d => d.status === 'interested' || d.user_feedback === 'interested').length,
    passed: deals.filter(d => d.status === 'passed' || d.user_feedback === 'passed').length,
    pending: deals.filter(d => !d.user_feedback && d.status !== 'interested' && d.status !== 'passed').length
  }

  function formatMoney(amount) {
    if (!amount) return '$0'
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount}`
  }

  function getDisplayTitle(deal) {
    // Helper function to check if a field has meaningful data
    const isValidTitle = (text) => {
      if (!text) return false
      const lowerText = text.toLowerCase().trim()
      // Reject if it contains "sign nda" or common placeholder text
      if (lowerText.includes('sign nda') || lowerText.includes('view more details')) return false
      // Reject if too short (less than 3 chars)
      if (text.trim().length < 3) return false
      return true
    }

    // Priority: title > business_name > property_name > generic fallback
    // Changed priority since title has the best data in your database
    if (isValidTitle(deal.title)) {
      return deal.title.length > 80 ? deal.title.substring(0, 80) + '...' : deal.title
    }
    if (isValidTitle(deal.business_name)) {
      return deal.business_name
    }
    if (isValidTitle(deal.property_name)) {
      return deal.property_name
    }
    return 'Confidential Business Listing'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Mattoo Capital Group</h1>
          <p className="text-slate-600">Flippa Deal Pipeline</p>
          <p className="text-xs text-slate-400 mt-1">v2.0 - Fixed Title Display</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            📊 All Deals {stats.total}
          </button>
          <button
            onClick={() => setFilter('interested')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === 'interested'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            👍 Interested {stats.interested}
          </button>
          <button
            onClick={() => setFilter('passed')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === 'passed'
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            👎 Passed {stats.passed}
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === 'pending'
                ? 'bg-yellow-500 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            ⏳ Pending Review {stats.pending}
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-blue-500">
            <FiDollarSign className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-slate-600 text-sm">Total Deals</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-green-500">
            <FiDollarSign className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-slate-600 text-sm">Total Value</p>
            <p className="text-2xl font-bold text-slate-800">{formatMoney(stats.totalValue)}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-purple-500">
            <FiTrendingUp className="w-8 h-8 text-purple-500 mb-2" />
            <p className="text-slate-600 text-sm">Monthly Revenue</p>
            <p className="text-2xl font-bold text-slate-800">{formatMoney(stats.monthlyRevenue)}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-orange-500">
            <FiTrendingUp className="w-8 h-8 text-orange-500 mb-2" />
            <p className="text-slate-600 text-sm">Monthly Profit</p>
            <p className="text-2xl font-bold text-slate-800">{formatMoney(stats.monthlyProfit)}</p>
          </div>
        </div>

        {/* Deals Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading deals...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredDeals.map((deal) => (
              <div
                key={deal.deal_id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border border-slate-200"
              >
                {/* Deal Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 
                      onClick={() => navigate(`/deal/${deal.deal_id}`)}
                      className="text-xl font-bold text-slate-800 mb-2 cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2 group"
                    >
                      {getDisplayTitle(deal)}
                      <FiArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                    </h3>
                    {deal.status && (
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        deal.status === 'nda_signed' ? 'bg-blue-100 text-blue-800' :
                        deal.status === 'interested' ? 'bg-green-100 text-green-800' :
                        deal.status === 'passed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {deal.status === 'nda_signed' ? 'NDA Signed' :
                         deal.status === 'interested' ? 'Interested' :
                         deal.status === 'passed' ? 'Passed' :
                         deal.status || 'Ready to Sign'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Deal Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500">Asking Price</p>
                    <p className="text-lg font-bold text-slate-800">{formatMoney(deal.asking_price)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Monthly Revenue</p>
                    <p className="text-lg font-bold text-green-600">{formatMoney(deal.monthly_revenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Monthly Profit</p>
                    <p className="text-lg font-bold text-blue-600">{formatMoney(deal.monthly_profit)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Location</p>
                    <p className="text-sm font-medium text-slate-700">{deal.location || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Age</p>
                    <p className="text-sm font-medium text-slate-700">{deal.business_age || 'N/A'}</p>
                  </div>
                </div>

                {/* Deal Notes */}
                {deal.notes && (
                  <p className="text-sm text-slate-600 mb-4 p-3 bg-slate-50 rounded-lg">
                    {deal.notes}
                  </p>
                )}

                {/* Feedback Section */}
                {!deal.user_feedback && deal.status !== 'interested' && deal.status !== 'passed' && (
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">Provide Feedback:</p>
                    <textarea
                      className="w-full p-2 border border-slate-300 rounded-lg mb-2 text-sm"
                      placeholder="Optional: Add notes about why you're interested or passing..."
                      value={feedbackText[deal.deal_id] || ''}
                      onChange={(e) => setFeedbackText(prev => ({ ...prev, [deal.deal_id]: e.target.value }))}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => provideFeedback(deal.deal_id, 'interested', feedbackText[deal.deal_id])}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <FiThumbsUp /> Interested
                      </button>
                      <button
                        onClick={() => provideFeedback(deal.deal_id, 'passed', feedbackText[deal.deal_id])}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <FiThumbsDown /> Pass
                      </button>
                    </div>
                  </div>
                )}

                {/* Show feedback if provided */}
                {deal.user_feedback && (
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <div className={`p-3 rounded-lg ${
                      deal.user_feedback === 'interested' ? 'bg-green-50 border-l-4 border-green-500' :
                      'bg-red-50 border-l-4 border-red-500'
                    }`}>
                      <p className="font-medium text-sm">
                        {deal.user_feedback === 'interested' ? '✅ Marked as Interested' : '❌ Passed'}
                      </p>
                      {deal.feedback_reason && (
                        <p className="text-sm text-slate-600 mt-1">{deal.feedback_reason}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => copyMessage(deal)}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <FiCopy /> Copy Message
                  </button>
                  {deal.nda_link && (
                    <a
                      href={deal.nda_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      <FiExternalLink /> Sign NDA
                    </a>
                  )}
                  {deal.flippa_url && (
                    <a
                      href={deal.flippa_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      <FiExternalLink /> View on Flippa
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
