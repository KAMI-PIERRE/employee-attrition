import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function ModelInfo({ info }) {
  if (!info) return null

  const m = info.metrics || {}
  const importance = info.feature_importance || {}
  const topFeatures = Object.entries(importance)
    .slice(0, 8)
    .map(([name, value]) => ({ name: name.replace(/_/g, ' ').slice(0, 18), value: +(value * 100).toFixed(1) }))

  const metricItems = [
    { label: 'Accuracy', value: m.accuracy },
    { label: 'Precision', value: m.precision },
    { label: 'Recall', value: m.recall },
    { label: 'F1-Score', value: m.f1 },
    { label: 'ROC-AUC', value: m.roc_auc },
  ]

  return (
    <section className="model-panel" aria-labelledby="model-heading">
      <div className="model-panel-heading">
        <div><h2 id="model-heading">Model performance</h2><p>Validation set overview</p></div>
        <span className="model-chip">{info.best_model}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
        {metricItems.map(item => (
          <div key={item.label} className="metric-item">
            <p>{item.label}</p>
            <p className="metric-value">
              {item.value != null ? (item.value * 100).toFixed(1) + '%' : '—'}
            </p>
          </div>
        ))}
      </div>

      {topFeatures.length > 0 && (
        <>
          <h3 className="chart-heading">Top feature importance</h3>
          <div className="feature-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topFeatures} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fill: '#697770', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #dbe3dc', borderRadius: 4, fontSize: 12, color: '#27342d' }}
                  formatter={(v) => [`${v}%`, 'Importance']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {topFeatures.map((_, i) => (
                    <Cell key={i} fill={i < 3 ? '#287052' : '#9aaba0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  )
}
