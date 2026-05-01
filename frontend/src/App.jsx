import React, { useState } from 'react'
import { FileText, Code, Copy, Zap, Loader2 } from 'lucide-react'

function App() {
  const [text, setText] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleParse = async () => {
    if (!text.trim()) return
    
    setLoading(true)
    setResults([])
    
    try {
      const response = await fetch('http://127.0.0.1:5000/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      
      const data = await response.json()
      if (response.ok) {
        setResults(data.cvs || [])
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
    if (results.length === 0) return
    navigator.clipboard.writeText(JSON.stringify(results, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container">
      <header className="header">
        <h1>PasteCV <span style={{ fontSize: '1rem', verticalAlign: 'middle', opacity: 0.6 }}>PRO</span></h1>
        <p>Paste multiple CVs at once. We'll split and structure them for you.</p>
      </header>

      <main className="main-grid">
        {/* Input Card */}
        <div className="card">
          <div className="card-title">
            <FileText size={20} className="text-primary" />
            Paste all CVs here
          </div>
          <textarea 
            placeholder="Paste one or multiple CVs here. Claude will separate them automatically."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button 
            className="btn" 
            onClick={handleParse} 
            disabled={loading || !text.trim()}
          >
            {loading ? <span className="loader"></span> : <><Zap size={18} /> Extract {results.length > 0 ? results.length : ''} CVs</>}
          </button>
        </div>

        {/* Output Card */}
        <div className="card">
          <div className="card-title" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code size={20} className="text-primary" />
              Structured Results {results.length > 0 && <span className="badge">{results.length}</span>}
            </div>
          </div>
          <div className="output-container">
            {results.length > 0 ? (
              <>
                <button className="copy-btn" onClick={copyToClipboard} title="Copy all JSON">
                  {copied ? 'Copied All!' : <Copy size={16} />}
                </button>
                <pre>{JSON.stringify(results, null, 2)}</pre>
              </>
            ) : (
              <div style={{ color: '#64748b', textAlign: 'center', marginTop: '150px' }}>
                {loading ? 'Processing multiple CVs...' : 'Extracted CVs will appear here as a list...'}
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
