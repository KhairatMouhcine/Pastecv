import React, { useState } from 'react'
import { FileText, Code, Copy, Zap, Loader2, Upload, Download, Trash2, Eye, X, RotateCcw } from 'lucide-react'
import jsPDF from 'jspdf'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Container, Row, Col } from 'react-bootstrap'

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
    <div className="app-root pb-5">
      {/* ── Top Bar ───────────────────────────────────────── */}
      <header className="topbar mb-5">
        <Container fluid="lg" className="d-flex align-items-center justify-content-between">
          <div className="brand">
            <div className="brand-mark">P</div>
            <div className="brand-name">
              <div className="n">PASTECV PRO</div>
              <div className="tag">AI BATCH RESUME PARSER</div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-4">
            <button className="btn btn-ghost d-flex align-items-center gap-2" onClick={clearAll} style={{ border: 'none', color: 'var(--fg-3)' }}>
              <RotateCcw size={14} /> RESET
            </button>
          </div>
        </Container>
      </header>

      {/* ── Workspace ─────────────────────────────────────── */}
      <Container fluid="lg" className="workspace">
        <Row className="g-4">
          
          {/* ── Collection Pane ── */}
          <Col lg={6}>
            <div className="pane">
              <div className="corner tl"></div><div className="corner tr"></div>
              <div className="corner bl"></div><div className="corner br"></div>
              
              <div className="pane-head">
                <h2>COLLECTION <span className="seg ms-2">/ FILE BATCH</span></h2>
                <div className="seg">{selectedFiles.length > 0 ? 'STAGED' : 'EMPTY'}</div>
              </div>

              <div className="d-flex gap-2 mb-3">
                <button className={`btn ${selectedFiles.length === 0 ? 'btn-primary' : ''}`} onClick={() => setSelectedFiles([])}>
                  <FileText size={14} /> PASTE TEXT
                </button>
                <label className={`btn ${selectedFiles.length > 0 ? 'btn-primary' : ''}`} style={{ cursor: 'pointer' }}>
                  <Upload size={14} /> UPLOAD FILES
                  <input type="file" hidden multiple accept=".pdf,.docx,.txt" onChange={handleFileSelect} />
                </label>
              </div>

              {selectedFiles.length > 0 ? (
                <div className="file-list p-3" style={{ background: 'var(--bg-2)', border: '1px solid var(--divider)', borderRadius: 'var(--r-md)', flex: 1 }}>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="d-flex align-items-center justify-content-between mb-2 p-2" style={{ borderBottom: '1px solid var(--divider)' }}>
                      <span style={{ fontSize: '13px' }}>{file.name}</span>
                      <X size={14} style={{ color: 'var(--err)', cursor: 'pointer' }} onClick={() => removeFile(index)} />
                    </div>
                  ))}
                </div>
              ) : (
                <textarea 
                  placeholder="Paste raw resume text or upload a batch of files on the left..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              )}

              <div className="mt-4 d-flex align-items-center justify-content-between">
                <div className="seg" style={{ fontSize: '10px' }}>Awaiting input</div>
                <button 
                  className="btn btn-primary" 
                  onClick={selectedFiles.length > 0 ? handleProcessFiles : handleParse} 
                  disabled={loading || (selectedFiles.length === 0 && !text.trim())}
                >
                  {loading ? <span className="loader"></span> : <><Zap size={14} /> ANALYZE WITH AI</>}
                </button>
              </div>
            </div>
          </Col>

          {/* ── Extraction Pane ── */}
          <Col lg={6}>
            <div className="pane">
              <div className="corner tl"></div><div className="corner tr"></div>
              <div className="corner bl"></div><div className="corner br"></div>

              <div className="pane-head">
                <h2>EXTRACTION <span className="seg ms-2">/ {loading ? 'PROCESSING' : 'AWAITING'}</span></h2>
                {results.length > 0 && (
                  <div className="d-flex gap-2">
                    <button className="btn" onClick={copyToClipboard}>
                      <Copy size={14} />
                    </button>
                    <button className="btn" onClick={downloadPDF}>
                      <Download size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="output-container d-flex flex-column" style={{ minHeight: '500px' }}>
                {results.length > 0 ? (
                  <pre style={{ margin: 0, color: 'var(--accent)' }}>{JSON.stringify(results, null, 2)}</pre>
                ) : (
                  <div className="empty-state">
                    {loading ? (
                      <div className="d-flex flex-column align-items-center gap-3">
                        <Loader2 size={40} className="animate-spin" />
                        <p className="seg">AI IS ANALYZING DATA...</p>
                      </div>
                    ) : (
                      <>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, var(--accent), var(--violet-900))', boxShadow: 'var(--glow-dot)', marginBottom: '20px' }}></div>
                        <h3>No extraction yet</h3>
                        <p className="seg" style={{ maxWidth: '300px', fontSize: '12px' }}>
                          Paste raw resume text or upload a batch of files on the left, then trigger the AI analysis. Structured candidate records will appear here.
                        </p>
                        <div className="d-flex gap-2 mt-4">
                          <span className="badge border border-secondary text-secondary" style={{ fontSize: '10px', background: 'transparent' }}>MULTI-CV DETECTION</span>
                          <span className="badge border border-secondary text-secondary" style={{ fontSize: '10px', background: 'transparent' }}>PDF · DOCX · TXT</span>
                          <span className="badge border border-secondary text-secondary" style={{ fontSize: '10px', background: 'transparent' }}>JSON EXPORT</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Col>

        </Row>
      </Container>
    </div>
  )
}

export default App
