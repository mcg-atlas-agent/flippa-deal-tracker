import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import toast, { Toaster } from 'react-hot-toast'
import { FiExternalLink } from 'react-icons/fi'

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
      
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '16px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', color: 'white', fontWeight: 600 }}>
                Mattoo Capital Group
              </h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.9)' }}>
                Flippa Deal Pipeline • v2.2 - Fixed Table Alignment
              </p>
            </div>
            
            {/* Stats */}
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
          
          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            {[
              { key: 'all', label: `📊 All Deals ${stats.total}` },
              { key: 'interested', label: `👍 Interested ${stats.interested}` },
              { key: 'passed', label: `👎 Passed ${stats.passed}` },
              { key: 'pending', label: `⏳ Pending Review ${stats.pending}` }
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

      {/* Table */}
      <div style={{ maxWidth: '1600px', margin: '20px auto', padding: '0 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading deals...</div>
        ) : (
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#495057', textTransform: 'uppercase', letterSpacing: '0.5px', width: '35%', minWidth: '300px' }}>
                    Business
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#495057', textTransform: 'uppercase', letterSpacing: '0.5px', width: '90px' }}>
                    Price
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#495057', textTransform: 'uppercase', letterSpacing: '0.5px', width: '100px' }}>
                    Revenue/mo
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#495057', textTransform: 'uppercase', letterSpacing: '0.5px', width: '90px' }}>
                    Profit/mo
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#495057', textTransform: 'uppercase', letterSpacing: '0.5px', width: '70px' }}>
                    Margin
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#495057', textTransform: 'uppercase', letterSpacing: '0.5px', width: '60px' }}>
                    Age
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#495057', textTransform: 'uppercase', letterSpacing: '0.5px', width: '150px' }}>
                    Location
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#495057', textTransform: 'uppercase', letterSpacing: '0.5px', width: '130px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal, idx) => {
                  const margin = deal.monthly_revenue > 0 
                    ? ((deal.monthly_profit / deal.monthly_revenue) * 100).toFixed(0) 
                    : 0
                  const displayTitle = deal.title || deal.business_name || 'Confidential Listing'
                  const statusBadge = deal.status === 'interested' ? '✅' : 
                                     deal.status === 'passed' ? '❌' : 
                                     deal.status === 'nda_signed' ? '📝' : '🆕'
                  
                  return (
                    <tr 
                      key={deal.deal_id}
                      style={{ 
                        borderBottom: '1px solid #f1f3f5',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      {/* Business Name */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px', flexShrink: 0 }}>{statusBadge}</span>
                          <Link 
                            to={`/deal/${deal.deal_id}`}
                            style={{ 
                              color: '#495057',
                              textDecoration: 'none',
                              fontWeight: 500,
                              fontSize: '13px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: '1.4'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#667eea'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#495057'}
                          >
                            {displayTitle}
                          </Link>
                        </div>
                      </td>

                      {/* Price */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, fontSize: '13px', whiteSpace: 'nowrap' }}>
                        ${(deal.asking_price/1000).toFixed(0)}K
                      </td>

                      {/* Revenue */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#0ca678', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        ${(deal.monthly_revenue/1000).toFixed(0)}K
                      </td>

                      {/* Profit */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#667eea', fontWeight: 500, fontSize: '13px', whiteSpace: 'nowrap' }}>
                        ${(deal.monthly_profit/1000).toFixed(0)}K
                      </td>

                      {/* Margin */}
                      <td style={{ 
                        padding: '12px 16px',
                        textAlign: 'right',
                        color: margin > 30 ? '#0ca678' : margin > 15 ? '#ff8c42' : '#dc3545',
                        fontWeight: 500,
                        fontSize: '13px',
                        whiteSpace: 'nowrap'
                      }}>
                        {margin}%
                      </td>

                      {/* Age */}
                      <td style={{ padding: '12px 16px', color: '#6c757d', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {deal.business_age}y
                      </td>

                      {/* Location */}
                      <td style={{ 
                        padding: '12px 16px',
                        fontSize: '12px',
                        color: '#6c757d',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '150px'
                      }}>
                        {deal.location}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                          {deal.status !== 'interested' && deal.status !== 'passed' && (
                            <>
                              <button
                                onClick={() => updateDealStatus(deal.deal_id, 'interested')}
                                title="Mark as Interested"
                                style={{
                                  padding: '6px 12px',
                                  border: '1px solid #0ca678',
                                  borderRadius: '4px',
                                  background: 'white',
                                  color: '#0ca678',
                                  fontSize: '14px',
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
                                title="Mark as Passed"
                                style={{
                                  padding: '6px 12px',
                                  border: '1px solid #dc3545',
                                  borderRadius: '4px',
                                  background: 'white',
                                  color: '#dc3545',
                                  fontSize: '14px',
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
                            title="View on Flippa"
                            style={{
                              padding: '6px 10px',
                              border: '1px solid #dee2e6',
                              borderRadius: '4px',
                              background: 'white',
                              color: '#6c757d',
                              fontSize: '12px',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
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
                            <FiExternalLink size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
