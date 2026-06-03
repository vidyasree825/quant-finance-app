import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CompanyList() {
  const [companies, setCompanies] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('https://quant-finance-app-production.up.railway.app/companies')
      .then(r => r.json())
      .then(data => { setCompanies(data.companies); setLoading(false) })
  }, [])

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.ticker.toLowerCase().includes(search.toLowerCase()) ||
    c.sector.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
        📈 Quant Finance Dashboard
      </h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Select a company to run backtesting analysis
      </p>
      <input
        placeholder="Search by name, ticker or sector..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '10px 14px', fontSize: 15,
          border: '1px solid #ddd', borderRadius: 8,
          marginBottom: 20, boxSizing: 'border-box'
        }}
      />
      {loading ? <p>Loading companies...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              {['Ticker', 'Company Name', 'Sector', 'Action'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontSize: 13, fontWeight: 600, color: '#444',
                  borderBottom: '2px solid #e0e0e0'
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.ticker} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1a56db' }}>{c.ticker}</td>
                <td style={{ padding: '12px 16px' }}>{c.name}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    background: '#e8f0fe', color: '#1a56db',
                    padding: '2px 10px', borderRadius: 12, fontSize: 12
                  }}>{c.sector}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    onClick={() => navigate(`/backtest/${c.ticker}`)}
                    style={{
                      background: '#1a56db', color: '#fff',
                      border: 'none', borderRadius: 6,
                      padding: '6px 16px', cursor: 'pointer', fontSize: 13
                    }}>
                    Run Backtest →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}