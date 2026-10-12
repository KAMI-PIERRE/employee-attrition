import React from 'react'

export default function ResultCard({ result, error, loading }) {
  if (loading) {
    return (
      <div className="result-content result-loading" aria-live="polite">
        <span className="loading-indicator" />
        <p>Assessing profile</p>
        <span className="loading-line" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="result-content result-error" role="alert">
        <span className="error-mark" aria-hidden="true">!</span>
        <div><h3>Assessment could not be completed</h3><p>{error}</p></div>
      </div>
    )
  }

  if (!result) return null

  const isLeave = result.prediction === 1
  const pct = Math.round(result.probability * 100)

  return (
    <div className={`result-content ${isLeave ? 'result-risk' : 'result-stable'}`} aria-live="polite">
      <div className="result-verdict">
        <span className="verdict-label">MODEL ESTIMATE</span>
        <h3>{isLeave ? 'Higher likelihood' : 'Lower likelihood'}</h3>
        <p>{isLeave ? 'of attrition' : 'of attrition'}</p>
      </div>
      <p className="result-message">{result.message}</p>
      <div className="probability-block">
        <div className="probability-heading">
          <span>Estimated attrition probability</span>
          <strong>{pct}<span>%</span></strong>
        </div>
        <div
          className="probability-track"
          role="progressbar"
          aria-label="Estimated attrition probability"
          aria-valuenow={pct}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <span style={{ width: `${pct}%` }} />
        </div>
        <div className="probability-scale"><span>0%</span><span>100%</span></div>
      </div>
      <div className="result-metadata">
        <span>Classification <strong>{isLeave ? 'Leave' : 'Stay'}</strong></span>
        <span>Raw score <strong>{result.probability.toFixed(4)}</strong></span>
      </div>
    </div>
  )
}
