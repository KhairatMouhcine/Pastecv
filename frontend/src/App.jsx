import React, { useState } from 'react'
import { FileText, Code, Copy, Zap, Loader2 } from 'lucide-react'

function App() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleParse = async () => {
    if (!text.trim()) return
    
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('http://127.0.0.1:5000/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      
      const data = await response.json()
      if (response.ok) {
        setResult(data)
      } else {
        alert(data.error || 'Something went wrong')
      }
    } catch (err) {
      alert('Could not connect to the backend. Make sure Flask is running!')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (!result) return
    navigator.clipboard.writeText(JSON.stringify(result, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container">
      <header className="header">
        <h1>PasteCV</h1>
        <p>Transform messy CVs into clean, structured JSON in seconds.</p>
      </header>

      <main className="main-grid">
        {/* Input Card */}
        <div className="card">
          <div className="card-title">
            <FileText size={20} className="text-primary" />
            Raw CV Text
          </div>
          <textarea 
            placeholder="Paste CV text here... (e.g., Name, Experience, Skills)"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button 
            className="btn" 
            onClick={handleParse} 
            disabled={loading || !text.trim()}
          >
            {loading ? <span className="loader"></span> : <><Zap size={18} /> Extract JSON</>}
          </button>
        </div>

        {/* Output Card */}
        <div className="card">
          <div className="card-title">
            <Code size={20} className="text-primary" />
            Structured Output
          </div>
          <div className="output-container">
            {result ? (
              <>
                <button className="copy-btn" onClick={copyToClipboard} title="Copy JSON">
                  {copied ? 'Copied!' : <Copy size={16} />}
                </button>
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </>
            ) : (
              <div style={{ color: '#64748b', textAlign: 'center', marginTop: '150px' }}>
                Extracted data will appear here...
              </div>
            )}
          </div>
        </div>
      </main>

      <footer style={{ textAlign: 'center', marginTop: '4rem', color: '#64748b', fontSize: '0.9rem' }}>
        Built with Flask, Groq, and React • 30 Day Ship Challenge
      </footer>
    </div>
  )
}

export default App
