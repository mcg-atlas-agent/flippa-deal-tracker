import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiExternalLink, FiAlertTriangle, FiCheck, FiPackage, FiBarChart2, FiShield } from 'react-icons/fi'

const supabase = createClient(
  'https://wjlvkixydrormgnvxdrm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqbHZraXh5ZHJvcm1nbnZ4ZHJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODIyNDUsImV4cCI6MjA4ODE1ODI0NX0.A0dzsJPpQFDz0ZXUK6TWaG4bgu8PBW0x2txoqwbnXYg'
)

// Sample P&L data
const SAMPLE_PNL = {
  '12624426': [
    { month: 'Apr 2025', revenue: 711086, expenses: 539728, profit: 171358 },
    { month: 'May 2025', revenue: 390947, expenses: 299879, profit: 91068 },
    { month: 'Jun 2025', revenue: 254313, expenses: 198527, profit: 55786 },
    { month: 'Jul 2025', revenue: 315418, expenses: 248274, profit: 67144 },
    { month: 'Aug 2025', revenue: 262832, expenses: 214899, profit: 47933 },
    { month: 'Sep 2025', revenue: 190847, expenses: 165753, profit: 25094 },
    { month: 'Oct 2025', revenue: 172427, expenses: 160157, profit: 12270 },
    { month: 'Nov 2025', revenue: 115161, expenses: 94764, profit: 20397 },
    { month: 'Dec 2025', revenue: 246722, expenses: 192104, profit: 54618 },
    { month: 'Jan 2026', revenue: 339509, expenses: 294477, profit: 45032 },
    { month: 'Feb 2026', revenue: 257737, expenses: 235202, profit: 22535 },
    { month: 'Mar 2026', revenue: 197978, expenses: 175119, profit: 22859 }
  ]
}

const SAMPLE_RISKS = {
  '12624426': [
    {
      severity: 'HIGH',
      title: 'Severe Revenue Decline',
      description: 'Revenue declined 37.4% from first half to second half of the year',
      questions: [
        'What caused the significant drop in sales starting in June 2025?',
        'Has there been a change in marketing strategy or ad spend?',
        'Were there any platform changes (iOS14, Meta policy changes)?',
        'Is this seasonality or a permanent trend?'
      ]
    },
    {
      severity: 'HIGH',
      title: 'Extreme Revenue Volatility',
      description: 'Revenue swings by 207% between peak and trough months',
      questions: [
        'What explains the massive revenue spike in April 2025?',
        'Was April a one-time viral campaign or sustainable?',
        'Can the business replicate April performance?',
        'Is the business dependent on unpredictable viral moments?'
      ]
    },
    {
      severity: 'MEDIUM',
      title: 'Eroding Profit Margins',
      description: 'Profit margins have declined from ~23.1% to ~11.2%',
      questions: [
        'Have COGS increased due to supplier price hikes?',
        'Has customer acquisition cost (CAC) increased?',
        'Are there increasing returns/refunds?',
        'What is causing expense growth relative to revenue?'
      ]
    },
    {
      severity: 'MEDIUM',
      title: 'Near-Breakeven Month (Oct 2025)',
      description: 'Profit dropped to only $12,270 (margin: 7.1%)',
      questions: [
        'What happened in October 2025 that caused profitability to crash?',
        'Is this seasonal or operational?',
        'Are fixed costs too high relative to baseline revenue?'
      ]
    },
    {
      severity: 'LOW',
      title: 'Unpredictable Performance',
      description: 'Recent months show no consistent trend - alternating between good and bad performance',
      questions: [
        'Is the business overly dependent on campaign timing?',
        'Are there structural issues with customer retention?',
        'What is the repeat purchase rate?'
      ]
    }
  ]
}

// Business descriptions from Flippa
const BUSINESS_INFO = {
  '12624426': {
    title: "Amelia's Jewelry",
    subtitle: "A 1.5 Year Old Jewelry Store Selling In U.S.",
    description: "Total Revenue $4.9M | Total Net Profit $1M | Cash flowing With Constant Profits & Stable Revenue",
    
    whyStarted: `This business was founded with the goal of building a brand-led e-commerce company focused on a clearly defined and often overlooked demographic: women aged 45 and above in the United States. This audience is highly engaged with online shopping and typically has strong purchasing power, making it an attractive segment for a well-positioned brand.

Women in this demographic tend to value products that combine style, comfort, and practicality. They are also more likely to appreciate brands that feel thoughtful, relatable, and emotionally engaging rather than purely trend-driven. With this in mind, the business was developed around a product range that offers timeless, versatile jewelry designed for everyday wear as well as special occasions.

The brand was intentionally positioned to create a more personal connection with customers. Rather than focusing solely on transactions, the emphasis has been on building trust, storytelling, and a cohesive brand identity. This approach has helped foster stronger engagement, repeat purchases, and long-term customer relationships.`,

    whySelling: `The decision to sell is primarily strategic and based on a shift in focus by the founders rather than any limitations of the business itself. Over time, we have become increasingly involved in other ventures that require significant time, attention, and capital.

While the business continues to run smoothly and profitably, scaling it to its full potential requires consistent hands-on involvement across marketing, creative testing, product development, and brand expansion. Given our current commitments, we are no longer able to dedicate the level of focus needed to maximize its growth.`,

    operations: `Running the business primarily involves managing marketing campaigns and overseeing light day-to-day operations, as most processes are automated or handled by external partners.

The main driver of traffic and sales is Meta advertising (Facebook and Instagram). Orders are processed automatically through the supplier, and customer service mainly involves responding to inquiries. The business operates on a dropshipping model through Shopify with no inventory required.`,

    growthOpportunities: [
      'Expand creative testing across different formats (UGC, storytelling ads, lifestyle content)',
      'Launch on new channels: TikTok and Pinterest for jewelry marketing',
      'Introduce complementary collections and product bundles to increase AOV',
      'Implement email marketing flows (abandoned cart, post-purchase, win-back)',
      'Scale Meta advertising with proven creative frameworks'
    ],

    saleIncludes: [
      'Domains and brand assets',
      'Logo and brand collateral',
      'Web assets (theme files, source code)',
      'Image and video content',
      'Social media accounts + Ad Accounts',
      'Customer service email login',
      '247,988+ customer list',
      'Supplier introduction and contact details',
      'After-sale support included'
    ],

    metrics: {
      platform: 'Shopify',
      monetization: 'Dropshipping',
      traffic: '109,351 page views/mo',
      subscribers: '247,988 subscribers'
    }
  }
}

function DealDetail() {
  const { dealId } = useParams()
  const navigate = useNavigate()
  const [deal, setDeal] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDealDetails()
  }, [dealId])

  async function fetchDealDetails() {
    try {
      const { data, error } = await supabase
        .from('flippa_deals')
        .select('*')
        .eq('deal_id', dealId)
        .single()
      
      if (error) throw error
      setDeal(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Deal not found')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading...</div>
  }

  if (!deal) return null

  const pnlData = SAMPLE_PNL[dealId] || []
  const risks = SAMPLE_RISKS[dealId] || []
  const businessInfo = BUSINESS_INFO[dealId]
  const hasPnL = pnlData.length > 0
  
  // Calculate P&L metrics
  let pnlMetrics = null
  if (hasPnL) {
    const totalRevenue = pnlData.reduce((sum, m) => sum + m.revenue, 0)
    const totalProfit = pnlData.reduce((sum, m) => sum + m.profit, 0)
    const avgMargin = (totalProfit / totalRevenue * 100).toFixed(1)
    
    pnlMetrics = {
      totalRevenue,
      totalProfit,
      avgMargin,
      avgMonthlyRevenue: totalRevenue / pnlData.length,
      avgMonthlyProfit: totalProfit / pnlData.length
    }
  }

  const displayTitle = businessInfo?.title || deal.title || deal.business_name || 'Confidential Listing'
  const statusLabel = deal.status === 'interested' ? '✅ Marked as Interested' :
                      deal.status === 'passed' ? '❌ Passed' :
                      deal.status === 'nda_signed' ? '📝 NDA Signed' :
                      '🆕 New'

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            <FiArrowLeft /> Back to Deal Pipeline
          </button>
          <a
            href={deal.flippa_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 20px',
              border: '2px solid white',
              borderRadius: '6px',
              background: 'transparent',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            View on Flippa <FiExternalLink />
          </a>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '24px auto', padding: '0 24px' }}>
        
        {/* Hero Section */}
        <div style={{ background: 'white', padding: '32px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#212529', fontWeight: 600 }}>
                {displayTitle}
              </h1>
              {businessInfo?.subtitle && (
                <p style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#6c757d', fontWeight: 500 }}>
                  {businessInfo.subtitle}
                </p>
              )}
              {businessInfo?.description && (
                <p style={{ margin: '0', fontSize: '14px', color: '#495057', lineHeight: '1.6' }}>
                  {businessInfo.description}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', color: '#6c757d', fontSize: '14px' }}>
                <span style={{ 
                  padding: '4px 12px', 
                  background: deal.status === 'interested' ? '#d4edda' : 
                             deal.status === 'passed' ? '#f8d7da' : '#d1ecf1',
                  color: deal.status === 'interested' ? '#155724' :
                         deal.status === 'passed' ? '#721c24' : '#0c5460',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: 500
                }}>
                  {statusLabel}
                </span>
                <span>•</span>
                <span>{deal.location}</span>
                <span>•</span>
                <span>{deal.business_age} old</span>
              </div>
            </div>
            
            {/* Quick Metrics Card */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginLeft: '32px' }}>
              <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '6px', textAlign: 'center', minWidth: '140px' }}>
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Asking Price</div>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#212529' }}>
                  ${(deal.asking_price/1000).toFixed(0)}K
                </div>
              </div>
              <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '6px', textAlign: 'center', minWidth: '140px' }}>
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Monthly Revenue</div>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#0ca678' }}>
                  ${(deal.monthly_revenue/1000).toFixed(0)}K
                </div>
              </div>
              <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '6px', textAlign: 'center', minWidth: '140px' }}>
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Monthly Profit</div>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#667eea' }}>
                  ${(deal.monthly_profit/1000).toFixed(0)}K
                </div>
              </div>
              <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '6px', textAlign: 'center', minWidth: '140px' }}>
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Profit Margin</div>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#ff8c42' }}>
                  {deal.monthly_revenue > 0 ? ((deal.monthly_profit / deal.monthly_revenue) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          
          {/* Left Column - Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Business Overview */}
            {businessInfo && (
              <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#212529', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiBarChart2 /> Business Overview
                </h2>
                
                <h3 style={{ margin: '16px 0 8px 0', fontSize: '16px', color: '#495057', fontWeight: 600 }}>
                  Why was this business started?
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#495057', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {businessInfo.whyStarted}
                </p>

                <h3 style={{ margin: '16px 0 8px 0', fontSize: '16px', color: '#495057', fontWeight: 600 }}>
                  Why is this business being sold?
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#495057', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {businessInfo.whySelling}
                </p>

                <h3 style={{ margin: '16px 0 8px 0', fontSize: '16px', color: '#495057', fontWeight: 600 }}>
                  Day-to-Day Operations
                </h3>
                <p style={{ margin: '0', fontSize: '14px', color: '#495057', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {businessInfo.operations}
                </p>
              </div>
            )}

            {/* P&L Data */}
            {hasPnL && (
              <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#212529' }}>
                  Profit & Loss Statement (Last 12 Months)
                </h2>
                
                {/* P&L Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Total Revenue</div>
                    <div style={{ fontSize: '24px', fontWeight: 600, color: '#0ca678' }}>
                      ${(pnlMetrics.totalRevenue/1000).toFixed(0)}K
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
                      Avg: ${(pnlMetrics.avgMonthlyRevenue/1000).toFixed(0)}K/mo
                    </div>
                  </div>
                  
                  <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Total Profit</div>
                    <div style={{ fontSize: '24px', fontWeight: 600, color: '#667eea' }}>
                      ${(pnlMetrics.totalProfit/1000).toFixed(0)}K
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
                      Avg: ${(pnlMetrics.avgMonthlyProfit/1000).toFixed(0)}K/mo
                    </div>
                  </div>
                  
                  <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Avg Margin</div>
                    <div style={{ fontSize: '24px', fontWeight: 600, color: pnlMetrics.avgMargin > 20 ? '#0ca678' : '#ff8c42' }}>
                      {pnlMetrics.avgMargin}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
                      Over 12 months
                    </div>
                  </div>
                </div>

                {/* P&L Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                        <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600 }}>Month</th>
                        <th style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>Revenue</th>
                        <th style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>Expenses</th>
                        <th style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>Profit</th>
                        <th style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pnlData.map((month, idx) => {
                        const margin = (month.profit / month.revenue * 100).toFixed(1)
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f3f5' }}>
                            <td style={{ padding: '10px', fontWeight: 500 }}>{month.month}</td>
                            <td style={{ padding: '10px', textAlign: 'right', color: '#0ca678' }}>
                              ${month.revenue.toLocaleString()}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right', color: '#dc3545' }}>
                              ${month.expenses.toLocaleString()}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600, color: '#667eea' }}>
                              ${month.profit.toLocaleString()}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 500, color: margin > 20 ? '#0ca678' : margin > 10 ? '#ff8c42' : '#dc3545' }}>
                              {margin}%
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Risk Analysis */}
            {risks.length > 0 && (
              <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <FiAlertTriangle size={20} color="#ff8c42" />
                  <h2 style={{ margin: 0, fontSize: '20px', color: '#212529' }}>
                    Risk Analysis & Due Diligence Questions
                  </h2>
                </div>
                <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#6c757d' }}>
                  LLM-based analysis of P&L data identified the following concerns:
                </p>

                {risks.map((risk, idx) => {
                  const severityColor = risk.severity === 'HIGH' ? '#dc3545' :
                                       risk.severity === 'MEDIUM' ? '#ff8c42' : '#ffc107'
                  const severityBg = risk.severity === 'HIGH' ? '#f8d7da' :
                                    risk.severity === 'MEDIUM' ? '#fff3cd' : '#fff8e1'
                  
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        padding: '16px', 
                        marginBottom: '12px', 
                        border: `1px solid ${severityColor}20`,
                        borderLeft: `4px solid ${severityColor}`,
                        borderRadius: '6px',
                        background: `${severityColor}05`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ 
                          padding: '2px 8px', 
                          background: severityBg, 
                          color: severityColor,
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          {risk.severity}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#212529' }}>
                          {risk.title}
                        </h3>
                      </div>
                      <p style={{ margin: '8px 0', fontSize: '14px', color: '#495057' }}>
                        {risk.description}
                      </p>
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#495057', marginBottom: '6px' }}>
                          Questions for Seller:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {risk.questions.map((q, qIdx) => (
                            <li key={qIdx} style={{ fontSize: '13px', color: '#495057', marginBottom: '4px' }}>
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Actions Card */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#212529', fontWeight: 600 }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a
                  href={deal.nda_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '12px 20px',
                    background: '#667eea',
                    color: 'white',
                    borderRadius: '6px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#5568d3'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
                >
                  <FiShield /> Sign NDA
                </a>
                <a
                  href={deal.flippa_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '12px 20px',
                    background: 'white',
                    color: '#667eea',
                    border: '1px solid #667eea',
                    borderRadius: '6px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#667eea'
                    e.currentTarget.style.color = 'white'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.color = '#667eea'
                  }}
                >
                  <FiExternalLink /> View Full Listing
                </a>
              </div>
            </div>

            {/* Sale Includes */}
            {businessInfo?.saleIncludes && (
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#212529', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiPackage /> What's Included
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#495057', lineHeight: '2' }}>
                  {businessInfo.saleIncludes.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>
                      <FiCheck size={14} color="#0ca678" style={{ display: 'inline', marginRight: '6px' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Growth Opportunities */}
            {businessInfo?.growthOpportunities && (
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#212529', fontWeight: 600 }}>
                  💡 Growth Opportunities
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#495057', lineHeight: '2' }}>
                  {businessInfo.growthOpportunities.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '8px' }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Platform Details */}
            {businessInfo?.metrics && (
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#212529', fontWeight: 600 }}>
                  Platform & Metrics
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f3f5' }}>
                    <span style={{ color: '#6c757d' }}>Platform</span>
                    <span style={{ fontWeight: 500 }}>{businessInfo.metrics.platform}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f3f5' }}>
                    <span style={{ color: '#6c757d' }}>Monetization</span>
                    <span style={{ fontWeight: 500 }}>{businessInfo.metrics.monetization}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f3f5' }}>
                    <span style={{ color: '#6c757d' }}>Monthly Traffic</span>
                    <span style={{ fontWeight: 500 }}>{businessInfo.metrics.traffic}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6c757d' }}>Email List</span>
                    <span style={{ fontWeight: 500 }}>{businessInfo.metrics.subscribers}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DealDetail
