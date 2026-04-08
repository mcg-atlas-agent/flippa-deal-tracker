import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import toast, { Toaster } from 'react-hot-toast'
import { FiDollarSign, FiTrendingUp, FiCheckCircle, FiXCircle, FiClock, FiCopy, FiExternalLink, FiThumbsUp, FiThumbsDown, FiMessageSquare, FiArrowRight } from 'react-icons/fi'

const supabase = createClient(
  'https://wjlvkixydrormgnvxdrm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqbHZraXh5ZHJvcm1nbnZ4ZHJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODIyNDUsImV4cCI6MjA4ODE1ODI0NX0.A0dzsJPpQFDz0ZXUK6TWaG4bgu8PBW0x2txoqwbnXYg'
)

function App() {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchDeals()
  }, [])

  async function fetchDeals() {
    try {
      const { data, error } = await supabase
        .from('flippa_deals')
        .select('*')
        .order('monthly_profit', { ascending: false })
      
      if (error) throw error
      setDeals(data || [])
    } catch (error) {
      console.error('Error fetching deals:', error)
      toast.error('Failed to load deals')
    } finally {
      setLoading(false)
    }
  }

  async function updateDealStatus(dealId, newStatus, feedback = '') {
    try {
      const updateData = { status: newStatus }
      if (feedback) {
        updateData.feedback = feedback
      }
      
      const { error } = await supabase
        .from('flippa_deals')
        .update(updateData)
        .eq('deal_id', dealId)
      
      if (error) throw error
      
      setDeals(deals.map(d => 
        d.deal_id === dealId 
          ? { ...d, status: newStatus, feedback: feedback || d.feedback }
          : d
      ))
      
      toast.success(newStatus === 'interested' ? 'Marked as Interested!' : 'Marked as Passed')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to update status')
    }
  }

  function copyMessage(deal) {
    if (deal.seller_message) {
      navigator.clipboard.writeText(deal.seller_message)
      toast.success('Message copied!')
    } else {
      toast.error('No message available')
    }
  }

  const filteredDeals = deals.filter(deal => {
    if (filter === 'all') return true
    if (filter === 'interested') return deal.status === 'interested'
    if (filter === 'passed') return deal.status === 'passed'
    return !['interested', 'passed'].includes(deal.status)
  })

  const stats = {
    total: deals.length,
    totalValue: deals.reduce((sum, d) => sum + (d.asking_price || 0), 0),
    monthlyRevenue: deals.reduce((sum, d) => sum + (d.monthly_revenue || 0), 0),
    monthlyProfit: deals.reduce((sum, d) => sum + (d.monthly_profit || 0), 0),
    interested: deals.filter(d => d.status === 'interested').length,
    passed: deals.filter(d => d.status === 'passed').length,
    pending: deals.filter(d => !['interested', 'passed'].includes(d.status)).length
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Toaster position="top-right" />
      
      {/* Compact Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '16px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', color: 'white', fontWeight: 600 }}>
                Mattoo Capital Group
              </h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.9)' }}>
                Flippa Deal Pipeline • v2.1 - Clickable Deal Titles + Detail Pages
              </p>
            </div>
            
            {/* Compact Stats */}
            <div style={{ display: 'flex', gap: '24px', color: 'white', fontSize: '13px' }}>
              <div>
                <div style={{ opacity: 0.8 }}>Total Deals</div>
                <div style={{ fontSize: '20px', fontWeight: 600 }}>{stats.total}</div>
              </div>
              <div>
                <div style={{ opacity: 0.8 }}>Total Value</div>
                <div style={{ fontSize: '20px', fontWeight: 600 }}>${(stats.totalValue/1000000).toFixed(1)}M</div>
              </div>
              <div>
                <div style={{ opacity: 0.8 }}>Monthly Revenue</div>
                <div style={{ fontSize: '20px', fontWeight: 600 }}>${(stats.monthlyRevenue/1000).toFixed(0)}K</div>
              </div>
              <div>
                <div style={{ opacity: 0.8 }}>Monthly Profit</div>
                <div style={{ fontSize: '20px', fontWeight: 600 }}>${(stats.monthlyProfit/1000).toFixed(0)}K</div>
              </div>
            </div>
          </div>
          
          {/* Compact Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            {[
              { key: 'all', label: `📊 All Deals ${stats.total}`, count: stats.total },
              { key: 'interested', label: `👍 Interested ${stats.interested}`, count: stats.interested },
              { key: 'passed', label: `👎 Passed ${stats.passed}`, count: stats.passed },
              { key: 'pending', label: `⏳ Pending Review ${stats.pending}`, count: stats.pending }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: '6px 14px',
                  border: 'none',
                  borderRadius: '6px',
                  background: filter === tab.key ? 'white' : 'rgba(255,255,255,0.2)',
                  color: filter === tab.key ? '#667eea' : 'white',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Compact Table-style Deal List */}
      <div style={{ maxWidth: '1400px', margin: '20px auto', padding: '0 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading deals...</div>
        ) : (
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            {/* Table Header */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '2fr 100px 110px 100px 90px 80px 200px 140px',
              gap: '12px',
              padding: '12px 16px',
              background: '#f8f9fa',
              borderBottom: '1px solid #e9ecef',
              fontSize: '11px',
              fontWeight: 600,
              color: '#495057',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <div>Business</div>
              <div style={{ textAlign: 'right' }}>Price</div>
              <div style={{ textAlign: 'right' }}>Revenue/mo</div>
              <div style={{ textAlign: 'right' }}>Profit/mo</div>
              <div style={{ textAlign: 'right' }}>Margin</div>
              <div>Age</div>
              <div>Location</div>
              <div>Actions</div>
            </div>

            {/* Table Rows */}
            {filteredDeals.map((deal, idx) => {
              const margin = deal.monthly_revenue > 0 
                ? ((deal.monthly_profit / deal.monthly_revenue) * 100).toFixed(0) 
                : 0
              const displayTitle = deal.title || deal.business_name || 'Confidential Listing'
              const statusBadge = deal.status === 'interested' ? '✅' : 
                                 deal.status === 'passed' ? '❌' : 
                                 deal.status === 'nda_signed' ? '📝' : '🆕'
              
              return (
                <div 
                  key={deal.deal_id}
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 100px 110px 100px 90px 80px 200px 140px',
                    gap: '12px',
                    padding: '12px 16px',
                    borderBottom: idx < filteredDeals.length - 1 ? '1px solid #f1f3f5' : 'none',
                    fontSize: '13px',
                    alignItems: 'center',
                    transition: 'background 0.15s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  {/* Business Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{statusBadge}</span>
                    <Link 
                      to={`/deal/${deal.deal_id}`}
                      style={{ 
                        color: '#495057',
                        textDecoration: 'none',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#667eea'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#495057'}
                    >
                      {displayTitle}
                    </Link>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'right', fontWeight: 500 }}>
                    ${(deal.asking_price/1000).toFixed(0)}K
                  </div>

                  {/* Revenue */}
                  <div style={{ textAlign: 'right', color: '#0ca678' }}>
                    ${(deal.monthly_revenue/1000).toFixed(0)}K
                  </div>

                  {/* Profit */}
                  <div style={{ textAlign: 'right', color: '#667eea', fontWeight: 500 }}>
                    ${(deal.monthly_profit/1000).toFixed(0)}K
                  </div>

                  {/* Margin */}
                  <div style={{ 
                    textAlign: 'right',
                    color: margin > 30 ? '#0ca678' : margin > 15 ? '#ff8c42' : '#dc3545',
                    fontWeight: 500
                  }}>
                    {margin}%
                  </div>

                  {/* Age */}
                  <div style={{ color: '#6c757d' }}>
                    {deal.business_age}y
                  </div>

                  {/* Location */}
                  <div style={{ 
                    fontSize: '12px',
                    color: '#6c757d',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {deal.location}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {deal.status !== 'interested' && deal.status !== 'passed' && (
                      <>
                        <button
                          onClick={() => updateDealStatus(deal.deal_id, 'interested')}
                          style={{
                            padding: '4px 10px',
                            border: '1px solid #0ca678',
                            borderRadius: '4px',
                            background: 'white',
                            color: '#0ca678',
                            fontSize: '11px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#0ca678'
                            e.currentTarget.style.color = 'white'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white'
                            e.currentTarget.style.color = '#0ca678'
                          }}
                        >
                          👍
                        </button>
                        <button
                          onClick={() => updateDealStatus(deal.deal_id, 'passed')}
                          style={{
                            padding: '4px 10px',
                            border: '1px solid #dc3545',
                            borderRadius: '4px',
                            background: 'white',
                            color: '#dc3545',
                            fontSize: '11px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#dc3545'
                            e.currentTarget.style.color = 'white'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white'
                            e.currentTarget.style.color = '#dc3545'
                          }}
                        >
                          👎
                        </button>
                      </>
                    )}
                    <a
                      href={deal.flippa_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        background: 'white',
                        color: '#6c757d',
                        fontSize: '11px',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#667eea'
                        e.currentTarget.style.color = '#667eea'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#dee2e6'
                        e.currentTarget.style.color = '#6c757d'
                      }}
                    >
                      <FiExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
