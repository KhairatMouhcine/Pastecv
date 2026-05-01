import React, { useState } from 'react'
import { FileText, Code, Copy, Zap, Loader2, Upload, Download, Trash2 } from 'lucide-react'
import jsPDF from 'jspdf'

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
      if (response.ok) setResults(data.cvs || [])
      else alert(data.error || 'Something went wrong')
    } catch (err) {
      alert('Could not connect to the backend. Make sure Flask is running!')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setLoading(true)
    setResults([])
    
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      if (response.ok) setResults(data.cvs || [])
      else alert(data.error || 'Something went wrong')
    } catch (err) {
      alert('Could not connect to the backend. Make sure Flask is running!')
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('PasteCV - Extraction Report', 20, 20)
    doc.setFontSize(10)
    doc.text(`Generated on ${new Date().toLocaleString()}`, 20, 30)
    
    let y = 50
    results.forEach((cv, index) => {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(14)
      doc.setTextColor(139, 92, 246)
      doc.text(`${index + 1}. ${cv.name || 'Unknown Candidate'}`, 20, y)
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.text(`Email: ${cv.email || 'N/A'}`, 20, y + 7)
      doc.text(`Skills: ${(cv.skills || []).join(', ')}`, 20, y + 14)
      y += 30
    })
    
    doc.save('extracted_cvs.pdf')
  }

  const copyToClipboard = () => {
    if (results.length === 0) return
    navigator.clipboard.writeText(JSON.stringify(results, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const clearAll = () => {
    setText('')
    setResults([])
  }

  return (
    <div className="container">
      <header className="header">
        <div className="logo-glow"></div>
        <h1>PasteCV <span className="badge">PRO</span></h1>
        <p>AI-Powered Batch Resume Parser</p>
      </header>

      <main className="main-grid">
        {/* Input Card */}
        <div className="card">
          <div className="card-title" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} className="text-primary" />
              Source Resumes
            </div>
            {text && <Trash2 size={18} className="text-muted" style={{ cursor: 'pointer' }} onClick={clearAll} />}
          </div>
          <textarea 
            placeholder="Paste text or upload multiple files (PDF, DOCX)..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="btn-group" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleParse} 
              disabled={loading || !text.trim()}
              style={{ flex: 2 }}
            >
              {loading ? <span className="loader"></span> : <><Zap size={18} /> Parse Text</>}
            </button>
            
            <label className="btn btn-secondary" style={{ flex: 1 }}>
              <Upload size={18} /> Batch
              <input 
                type="file" 
                hidden 
                multiple 
                accept=".pdf,.docx,.txt" 
                onChange={handleFileUpload}
                disabled={loading}
              />
            </label>
          </div>
        </div>

        {/* Output Card */}
        <div className="card">
          <div className="card-title" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code size={20} className="text-primary" />
              Extraction Output {results.length > 0 && <span className="badge-count">{results.length}</span>}
            </div>
            {results.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="icon-btn" onClick={copyToClipboard} title="Copy JSON">
                  {copied ? 'Done!' : <Copy size={16} />}
                </button>
                <button className="icon-btn" onClick={downloadPDF} title="Download PDF">
                  <Download size={16} />
                </button>
              </div>
            )}
          </div>
          <div className="output-container">
            {results.length > 0 ? (
              <pre>{JSON.stringify(results, null, 2)}</pre>
            ) : (
              <div className="empty-state">
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <span className="loader" style={{ width: '40px', height: '40px' }}></span>
                    <p>AI is analyzing your files...</p>
                  </div>
                ) : (
                  <p>Ready to structure your data.</p>
                )}
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
