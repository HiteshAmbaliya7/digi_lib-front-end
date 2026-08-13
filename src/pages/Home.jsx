import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Loader from '../components/Loader'
import '../styles/Home.css'

export default function Home() {
  const { isAdmin } = useAuth()

  const [pdfs, setPdfs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const fetchPdfs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/pdfs')
      setPdfs(res.data.pdfs || res.data || [])
    } catch (err) {
      setError('Could not load PDFs. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPdfs()
  }, [fetchPdfs])

  const handleFileSelect = (selected) => {
    if (selected && selected.type === 'application/pdf') {
      setFile(selected)
      setUploadMsg('')
    } else {
      setFile(null)
      setUploadMsg('Please select a valid PDF file.')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    handleFileSelect(e.dataTransfer.files?.[0])
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setUploadMsg('')
    try {
      const formData = new FormData()
      formData.append('pdf', file)
      await api.post('/pdfs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUploadMsg('PDF uploaded successfully!')
      setFile(null)
      fetchPdfs()
    } catch (err) {
      setUploadMsg(
        err.response?.data?.message || 'Upload failed. Please try again.'
      )
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (pdf) => {
    try {
      const res = await api.get(`/pdfs/${pdf.id}/download`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', pdf.filename || 'document.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Could not download this file.')
    }
  }

  const handleDelete = async (pdfId) => {
    if (!window.confirm('Are you sure you want to remove this PDF?')) return
    try {
      await api.delete(`/pdfs/${pdfId}`)
      setPdfs(prev => prev.filter(p => p.id !== pdfId))
    } catch (err) {
      setError('Could not remove the PDF.')
    }
  }

  return (
    <div className="app-page">
      <Navbar />
      <div className="container fade-in">
        <h1>Digi Library</h1>
        <p className="page-subtitle">
          {isAdmin
            ? 'Upload PDFs for everyone to view and download.'
            : 'Browse and download the PDFs shared by your admin.'}
        </p>

        {isAdmin && (
          <div className="card upload-card">
            <h2>Upload a PDF</h2>
            <form onSubmit={handleUpload}>
              <div
                className={`dropzone ${dragActive ? 'dropzone-active' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragActive(true)
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('pdf-input').click()}
              >
                <input
                  id="pdf-input"
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                />
                {file ? (
                  <p>{file.name}</p>
                ) : (
                  <p>Drag & drop a PDF here, or click to browse</p>
                )}
              </div>

              {uploadMsg && (
                <p
                  className={
                    uploadMsg.includes('success')
                      ? 'success-text'
                      : 'error-text'
                  }
                >
                  {uploadMsg}
                </p>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={!file || uploading}
                style={{ marginTop: 12 }}
              >
                {uploading ? 'Uploading...' : 'Upload PDF'}
              </button>
            </form>
          </div>
        )}

        <div className="card" style={{ marginTop: 24 }}>
          <h2>Available PDFs</h2>

          {loading && <Loader fullScreen={false} text="Loading PDFs..." />}
          {!loading && error && <p className="error-text">{error}</p>}
          {!loading && !error && pdfs.length === 0 && (
            <p className="page-subtitle">No PDFs have been uploaded yet.</p>
          )}

          {!loading && pdfs.length > 0 && (
            <ul className="pdf-list">
              {pdfs.map((pdf) => (
                <li key={pdf.id} className="pdf-item fade-in">
                  <div className="pdf-info">
                    <span className="pdf-icon">📄</span>
                    <div>
                      <p className="pdf-name">{pdf.filename}</p>
                      {pdf.uploadedAt && (
                        <p className="pdf-date">
                          Uploaded {new Date(pdf.uploadedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleDownload(pdf)}
                    >
                      Download
                    </button>
                    {isAdmin && (
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(pdf.id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
