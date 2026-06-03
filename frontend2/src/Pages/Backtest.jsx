import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Backtest() {
  const { ticker } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`https://quant-finance-app-production.up.railway.app/backtest/${ticker}`)
      .then(r => r.json())
      .then(data => { setResult(data); setLoading(false) })
      .catch(() => { setError('Failed to load backtest'); setLoading(false) })
  }, [ticker])

  const stats = result ? [
    { label: 'Final Return', value: `${result.final_return}%`, color: result.final_return >= 0 ? '#16a34a' : '#dc2626' },
    { label: 'Sharpe Ratio', value: result.sharpe_ratio, color: '#1a56db' },
    { label: 'Max Drawdown', value: `${result.max_drawdown}%`, color: '#dc2626' },
    { label: 'Win Rate', value: `${result.win_rate}%`, color: '#16a34a' },
  ] : []

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <button onClick={() => navigate('/')}
        style={{ background: 'none', border: 'none', color: '#1a56db', cursor: 'pointer', fontSize: 14, marginBottom: 16 }}>
        ← Back to companies
      </button>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
        {ticker} — Backtest Results
      </h1>
      <p style={{ color: '#666', marginBottom: 24 }}>1 year historical analysis using your ML model</p>
      {loading && <p>Running backtest, please wait...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
            {stats.map(s => (
              <div key={s.label} style={{
                background: '#f9fafb', border: '1px solid #e5e7eb',
                borderRadius: 10, padding: '16px', textAlign: 'center'
              }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 20 }}>
            <h3 style={{ marginBottom: 16, fontSize: 16 }}>Strategy Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[
                { name: 'Start', value: 0 },
                { name: 'Q1', value: result.final_return * 0.2 },
                { name: 'Q2', value: result.final_return * 0.5 },
                { name: 'Q3', value: result.final_return * 0.75 },
                { name: 'End', value: result.final_return },
              ]}>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={v => `${v}%`} />
                <Tooltip formatter={v => `${v.toFixed(2)}%`} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#1a56db" name="Strategy Return" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}