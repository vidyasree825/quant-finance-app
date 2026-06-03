import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CompanyList from './Pages/CompanyList'
import Backtest from './Pages/Backtest'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CompanyList />} />
        <Route path="/backtest/:ticker" element={<Backtest />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App