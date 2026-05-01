import React, { useState } from 'react'
import { FileText, Code, Copy, Zap, Loader2, Upload, Download, Trash2, Eye, X } from 'lucide-react'
import jsPDF from 'jspdf'

function App() {
  const [text, setText] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleProcessFiles = async () => {
    if (selectedFiles.length === 0) return
    setLoading(true)
    setResults([])
    
    const formData = new FormData()
    selectedFiles.forEach(file => {
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
      doc.setTextColor(127, 64, 255)
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
    setSelectedFiles([])
    setResults([])
  }

  return (
    <div className="app-root">
      {/* ── Top Bar ───────────────────────────────────────── */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">P</div>
          <div className="brand-name">
            <div className="n">PasteCV <span className="pro">PRO</span></div>
            <div className="tag">AI Batch Parser</div>
          </div>
        </div>
        <div className="top-actions">
          <button className="btn" onClick={clearAll}><Trash2 size={14} /> Clear System</button>
        </div>
      </header>

      {/* ── Workspace ─────────────────────────────────────── */}
      <main className="workspace">
        <div className="grid">
          
          {/* ── Input Pane ── */}
          <div className="pane">
            <div className="corner tl"></div><div className="corner tr"></div>
            <div className="corner bl"></div><div className="corner br"></div>
            
            <div className="pane-head">
              <h2>Source Resumes</h2>
              <div className="seg">Mode: <b>{selectedFiles.length > 0 ? 'Batch' : 'Text'}</b></div>
            </div>

            {selectedFiles.length > 0 ? (
              <div className="file-list">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <span className="file-name">{file.name}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Eye size={16} className="text-primary" style={{ cursor: 'pointer' }} />
                      <X size={16} style={{ color: 'var(--err)', cursor: 'pointer' }} onClick={() => removeFile(index)} />
                    </div>
                  </div>
                ))}
                <label className="btn" style={{ marginTop: 'auto', justifyContent: 'center', borderStyle: 'dashed' }}>
                  <Upload size={16} /> Add more files...
                  <input type="file" hidden multiple accept=".pdf,.docx,.txt" onChange={handleFileSelect} />
                </label>
              </div>
            ) : (
              <textarea 
                placeholder="Paste raw text here or use batch upload..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            )}

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              {selectedFiles.length > 0 ? (
                <button className="btn btn-primary" onClick={handleProcessFiles} disabled={loading} style={{ flex: 1 }}>
                  {loading ? <span className="loader" style={{ width: '14px', height: '14px', borderTopColor: 'white' }}></span> : <><Zap size={16} /> Process Batch</>}
                </button>
              ) : (
                <>
                  <button className="btn btn-primary" onClick={handleParse} disabled={loading || !text.trim()} style={{ flex: 2 }}>
                    {loading ? <span className="loader" style={{ width: '14px', height: '14px', borderTopColor: 'white' }}></span> : <><Zap size={16} /> Parse Text</>}
                  </button>
                  <label className="btn" style={{ flex: 1, justifyContent: 'center', cursor: 'pointer' }}>
                    <Upload size={16} /> Batch
                    <input type="file" hidden multiple accept=".pdf,.docx,.txt" onChange={handleFileSelect} />
                  </label>
                </>
              )}
            </div>
          </div>

          {/* ── Results Pane ── */}
          <div className="pane">
            <div className="corner tl"></div><div className="corner tr"></div>
            <div className="corner bl"></div><div className="corner br"></div>

            <div className="pane-head">
              <h2>Extraction Output</h2>
              {results.length > 0 && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn" onClick={copyToClipboard} title="Copy JSON">
                    {copied ? 'Copied' : <Copy size={14} />}
                  </button>
                  <button className="btn" onClick={downloadPDF} title="Download PDF">
                    <Download size={14} />
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
                      <p>AI is analyzing data...</p>
                    </div>
                  ) : (
                    <p>No results yet. Provide source resumes to begin.</p>
                  )}
                </div>
              )}
            </div>
            
            {results.length > 0 && (
              <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--fg-3)', textAlign: 'right' }}>
                Detected: <b>{results.length}</b> candidates
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

export default App
