import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiExternalLink, FiDollarSign, FiTrendingUp, FiCalendar } from 'react-icons/fi'

const supabase = createClient(
  'https://jpcpngckvxttmnczwyfh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwY3BuZ2Nrdnh0dG1uY3p3eWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MTY3MjcsImV4cCI6MjA1ODk5MjcyN30.sYeY2IUQl9BFfLsOmjUO0hI0EKKTVGaJuBHEf4qGOEQ'
)

function DealDetail() {
  const { dealId } = useParams()
  const navigate = useNavigate()
  const [deal, setDeal] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDealDetails()
  }, [dealId])

  async function fetchDealDetails() {
    setLoading(true)
    const { data, error } = await supabase
      .from('flippa_deals')
      .select('*')
      .eq('deal_id', dealId)
      .single()
    
    if (error) {
      toast.error('Failed to load deal details')
      console.error(error)
    } else {
      setDeal(data)
    }
    setLoading(false)
  }

  function formatMoney(amount) {
    if (!amount) return '$0'
    return `$${amount.toLocaleString()}`
  }

  function formatPercentage(value) {
    if (!value) return '0%'
    return `${value.toFixed(1)}%`
  }

  function getDisplayTitle(deal) {
    const isValidTitle = (text) => {
      if (!text) return false
      const lowerText = text.toLowerCase().trim()
      if (lowerText.includes('sign nda') || lowerText.includes('view more details')) return false
      if (text.trim().length < 3) return false
      return true
    }

    if (isValidTitle(deal.title)) return deal.title
    if (isValidTitle(deal.business_name)) return deal.business_name
    if (isValidTitle(deal.property_name)) return deal.property_name
    return 'Confidential Business Listing'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-600 text-lg">Loading deal details...</p>
        </div>
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-slate-800 mb-4">Deal not found</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            ← Back to Deals
          </button>
        </div>
      </div>
    )
  }

  const profitMargin = deal.monthly_revenue && deal.monthly_profit 
    ? (deal.monthly_profit / deal.monthly_revenue) * 100 
    : 0

  const annualRevenue = (deal.monthly_revenue || 0) * 12
  const annualProfit = (deal.monthly_profit || 0) * 12
  const multiple = deal.asking_price && annualProfit ? deal.asking_price / annualProfit : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors shadow-md mb-4"
          >
            <FiArrowLeft /> Back to Deal Pipeline
          </button>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                  {getDisplayTitle(deal)}
                </h1>
                {deal.status && (
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
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
              <div className="flex gap-2">
                {deal.flippa_url && (
                  <a
                    href={deal.flippa_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <FiExternalLink /> View on Flippa
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RLGL ONE SHEET Layout - Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* LEFT COLUMN: Income Statement / "The Deal" */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-3 border-b-2 border-blue-500">
                The Deal - Income Statement
              </h2>

              {/* Key Metrics */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center bg-slate-50 p-4 rounded-lg">
                  <div className="font-semibold text-sm text-slate-600">2025 (Current)</div>
                  <div className="font-semibold text-sm text-slate-600">2024</div>
                  <div className="font-semibold text-sm text-slate-600">2023</div>
                </div>

                <div className="border-b pb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-700">Revenues</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="text-lg font-bold text-green-600">{formatMoney(annualRevenue)}</div>
                    <div className="text-slate-400">-</div>
                    <div className="text-slate-400">-</div>
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Monthly: {formatMoney(deal.monthly_revenue)}</div>
                </div>

                <div className="border-b pb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-700">Gross Profit</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="text-lg font-bold text-green-600">{formatMoney(annualRevenue * 0.7)}</div>
                    <div className="text-slate-400">-</div>
                    <div className="text-slate-400">-</div>
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Estimated at 70% margin</div>
                </div>

                <div className="border-b pb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-700">EBITDA</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="text-lg font-bold text-blue-600">{formatMoney(annualProfit)}</div>
                    <div className="text-slate-400">-</div>
                    <div className="text-slate-400">-</div>
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Monthly: {formatMoney(deal.monthly_profit)}</div>
                </div>

                <div className="border-b pb-3">
                  <span className="font-semibold text-slate-700 block mb-2">Addbacks & Takebacks</span>
                  <div className="text-sm text-slate-500 italic">Data pending - Available after full NDA approval</div>
                </div>

                <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-800">Adjusted EBITDA</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{formatMoney(annualProfit)}</div>
                  <div className="text-sm text-slate-500 mt-1">Annual | Margin: {formatPercentage(profitMargin)}</div>
                </div>
              </div>

              {/* Valuation Section */}
              <div className="border-t-2 pt-6 space-y-3">
                <h3 className="font-bold text-slate-800 mb-4">Valuation Analysis</h3>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Average / Last 12 Months</span>
                  <span className="font-bold text-slate-800">{formatMoney(annualProfit)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Multiple (Mid Point)</span>
                  <span className="font-bold text-blue-600">{multiple.toFixed(1)}x</span>
                </div>

                <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
                  <span className="font-bold text-slate-800">Enterprise Value</span>
                  <span className="text-2xl font-bold text-green-600">{formatMoney(deal.asking_price)}</span>
                </div>
              </div>

              {/* Adjustments */}
              <div className="border-t-2 pt-6 mt-6 space-y-3">
                <h3 className="font-bold text-slate-800 mb-4">Adjustments</h3>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Cash / NCA</span>
                  <span className="text-slate-500 italic">Pending</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Real estate</span>
                  <span className="text-slate-500 italic">Pending</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Less inherited debt</span>
                  <span className="text-slate-500 italic">Pending</span>
                </div>

                <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg mt-4">
                  <span className="font-bold text-slate-800">100% Equity Value</span>
                  <span className="text-xl font-bold text-blue-600">{formatMoney(deal.asking_price)}</span>
                </div>
              </div>

              {/* Working Capital */}
              <div className="border-t-2 pt-6 mt-6 space-y-3">
                <h3 className="font-bold text-slate-800 mb-4">Working Capital Analysis</h3>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Min cash</span>
                  <span className="text-slate-500 italic">Pending</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Cash surplus / deficit</span>
                  <span className="text-slate-500 italic">Pending</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-700">NCA / working capital</span>
                  <span className="text-slate-500 italic">Pending</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg mt-4">
                  <span className="font-bold text-slate-800">Total surplus (deficit)</span>
                  <span className="text-slate-500 italic">Pending full financials</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Balance Sheet / "DEALMAKER WEALTH" */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-3 border-b-2 border-green-500">
                Balance Sheet Analysis
              </h2>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                <p className="text-sm font-medium text-yellow-800">
                  ⚠️ Balance Sheet data requires full financial access
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Available after NDA approval and seller consent
                </p>
              </div>

              {/* Assets Section */}
              <div className="space-y-4 mb-6">
                <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b">Assets</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Cash on hand</span>
                    <span className="text-slate-400 italic">Pending</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Inventory</span>
                    <span className="text-slate-400 italic">Pending</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">AR (Accounts Receivable)</span>
                    <span className="text-slate-400 italic">Pending</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Other</span>
                    <span className="text-slate-400 italic">Pending</span>
                  </div>
                  <div className="flex justify-between items-center bg-green-50 p-2 rounded font-semibold">
                    <span className="text-slate-800">Current Assets</span>
                    <span className="text-slate-400 italic">Pending</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-slate-600">Real Estate</span>
                    <span className="text-slate-400 italic">Pending</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Other Fixed Assets</span>
                    <span className="text-slate-400 italic">Pending</span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg font-bold mt-3">
                    <span className="text-slate-800">Total Assets</span>
                    <span className="text-slate-400 italic">Pending</span>
                  </div>
                </div>
              </div>

              {/* Liabilities Section */}
              <div className="space-y-4 mb-6 border-t-2 pt-6">
                <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b">Liabilities</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">AP (Accounts Payable)</span>
                    <span className="text-slate-400 italic">Pending</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Taxes</span>
                    <span className="text-slate-400 italic">Pending</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Accruals</span>
                    <span className="text-slate-400 italic">Pending</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Other Current Liabilities</span>
                    <span className="text-slate-400 italic">Pending</span>
                  </div>
                  <div className="flex justify-between items-center bg-red-50 p-2 rounded font-semibold">
                    <span className="text-slate-800">Current Liabilities</span>
                    <span className="text-slate-400 italic">Pending</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-slate-600">Non current liabilities</span>
                    <span className="text-slate-400 italic">Pending</span>
                  </div>
                </div>
              </div>

              {/* Equity Section */}
              <div className="space-y-4 border-t-2 pt-6">
                <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b">Equity</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg font-bold">
                    <span className="text-slate-800">Net Asset Value (Owner's Equity)</span>
                    <span className="text-slate-400 italic">Pending</span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg font-semibold">
                    <span className="text-slate-800">Liquidation Value (80% of NAV)</span>
                    <span className="text-slate-400 italic">Pending</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-600">Goodwill</span>
                    <span className="text-slate-400 italic">Pending</span>
                  </div>
                </div>
              </div>

              {/* RLGL Score Placeholder */}
              <div className="border-t-2 pt-6 mt-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-500 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">RLGL Score</h3>
                  <div className="text-4xl font-bold text-green-600 mb-2">?</div>
                  <p className="text-sm text-slate-600">Score pending full financial review</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Business Details */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4 pb-3 border-b">Business Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Location</span>
                <span className="font-semibold">{deal.location || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Business Age</span>
                <span className="font-semibold">{deal.business_age ? `${deal.business_age} years` : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Business Type</span>
                <span className="font-semibold">{deal.business_type || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Platform</span>
                <span className="font-semibold">{deal.platform || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Notes & Highlights */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4 pb-3 border-b">Notes & Highlights</h3>
            {deal.notes ? (
              <div className="prose prose-sm text-slate-700">
                {deal.notes}
              </div>
            ) : (
              <p className="text-slate-500 italic">No additional notes available</p>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Next Steps</h3>
              <p className="text-sm text-slate-600 mt-1">
                {deal.status === 'nda_signed' 
                  ? 'NDA signed - Awaiting full financial disclosure' 
                  : 'Sign NDA to unlock complete financial details'}
              </p>
            </div>
            <div className="flex gap-3">
              {deal.nda_link && (
                <a
                  href={deal.nda_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <FiExternalLink /> Sign NDA
                </a>
              )}
              {deal.flippa_url && (
                <a
                  href={deal.flippa_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <FiExternalLink /> View Full Listing
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DealDetail
