import React, { useState, useEffect } from 'react'
import axios from 'axios'
import PredictionForm from './components/PredictionForm'
import ResultCard from './components/ResultCard'
import ModelInfo from './components/ModelInfo'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modelInfo, setModelInfo] = useState(null)
  const [health, setHealth] = useState(null)

  useEffect(() => {
    // Health check
    axios.get(`${API_BASE}/health`)
      .then(res => setHealth(res.data))
      .catch(() => setHealth({ status: 'unreachable', model_loaded: false }))

    // Model info
    axios.get(`${API_BASE}/model-info`)
      .then(res => setModelInfo(res.data))
      .catch(() => setModelInfo(null))
  }, [])

  const handlePredict = async (formData) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await axios.post(`${API_BASE}/predict`, formData)
      setResult(res.data)
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Prediction failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const apiOnline = health?.status === 'healthy'

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#main" aria-label="People Analytics home">
          <span className="brand-mark" aria-hidden="true">P<span>.</span></span>
          <span className="brand-name">People<span>Analytics</span></span>
        </a>
        <div className="topbar-meta">
          <span className={`service-status ${apiOnline ? 'is-online' : health ? 'is-offline' : 'is-checking'}`}>
            <span className="status-dot" />
            {apiOnline ? 'Service online' : health ? 'Service unavailable' : 'Checking service'}
          </span>
          {apiOnline && (
            <span className={`model-status ${health.model_loaded ? 'is-ready' : 'is-unavailable'}`}>
              Model {health.model_loaded ? 'ready' : 'unavailable'}
            </span>
          )}
        </div>
      </header>

      <main id="main" className="workspace">
        <section className="page-heading" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">WORKFORCE INSIGHTS <span> / </span> RISK REVIEW</p>
            <h1 id="page-title">Attrition assessment</h1>
            <p className="page-description">Review an employee profile and explore the model’s estimated likelihood of attrition.</p>
          </div>
          <div className="assessment-tag"><span aria-hidden="true">01</span> Individual assessment</div>
        </section>

        <div className="workspace-grid">
          <section className="form-panel" aria-labelledby="employee-heading">
            <div className="panel-heading">
              <div className="section-index">01</div>
              <div>
                <h2 id="employee-heading">Employee profile</h2>
                <p>Enter the available role and tenure details.</p>
              </div>
            </div>
            <PredictionForm onSubmit={handlePredict} loading={loading} />
          </section>

          <aside className="insights-column" aria-label="Assessment insights">
            <section className="result-panel" aria-labelledby="result-heading">
              <div className="panel-heading panel-heading-compact">
                <div className="section-index">02</div>
                <div>
                  <h2 id="result-heading">Assessment result</h2>
                  <p>Model-generated estimate</p>
                </div>
              </div>
              {(result || error || loading) ? (
                <ResultCard result={result} error={error} loading={loading} />
              ) : (
                <div className="empty-result">
                  <div className="empty-mark" aria-hidden="true"><span /></div>
                  <p className="empty-title">Ready when you are</p>
                  <p>Complete the profile to see the estimated attrition likelihood here.</p>
                </div>
              )}
              <p className="decision-note">Use this estimate as one input for supportive, human-led conversations. It is not a standalone employment decision.</p>
            </section>

            {modelInfo && <ModelInfo info={modelInfo} />}
            {!modelInfo && health && (
              <section className="model-unavailable" aria-live="polite">
                <span className="model-unavailable-mark" aria-hidden="true">i</span>
                <div>
                  <h2>Model details unavailable</h2>
                  <p>Performance information could not be retrieved from the service.</p>
                </div>
              </section>
            )}
          </aside>
        </div>
        <footer className="page-footer">
          <span>PEOPLE ANALYTICS <span className="footer-divider">/</span> ATTRITION ASSESSMENT</span>
          <span>Predictions are estimates, not outcomes.</span>
        </footer>
      </main>
    </div>
  )
}

export default App
