import React, { useState } from 'react'

const initialState = {
  Education: 'Bachelors',
  JoiningYear: 2017,
  City: 'Bangalore',
  PaymentTier: 3,
  Age: 28,
  Gender: 'Male',
  EverBenched: 'No',
  ExperienceInCurrentDomain: 3,
}

export default function PredictionForm({ onSubmit, loading }) {
  const [form, setForm] = useState(initialState)

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  const fieldClass = 'field-control'

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <div className="field-grid">
        {/* Education */}
        <div className="field-group">
          <label htmlFor="education">Education</label>
          <select id="education" name="Education" value={form.Education} onChange={handleChange} className={fieldClass}>
            <option value="Bachelors">Bachelors</option>
            <option value="Masters">Masters</option>
            <option value="PHD">PHD</option>
          </select>
        </div>

        {/* City */}
        <div className="field-group">
          <label htmlFor="city">City</label>
          <select id="city" name="City" value={form.City} onChange={handleChange} className={fieldClass}>
            <option value="Bangalore">Bangalore</option>
            <option value="Pune">Pune</option>
            <option value="New Delhi">New Delhi</option>
          </select>
        </div>

        {/* Gender */}
        <div className="field-group">
          <label htmlFor="gender">Gender</label>
          <select id="gender" name="Gender" value={form.Gender} onChange={handleChange} className={fieldClass}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* EverBenched */}
        <div className="field-group">
          <label htmlFor="ever-benched">Previously benched</label>
          <select id="ever-benched" name="EverBenched" value={form.EverBenched} onChange={handleChange} className={fieldClass}>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        {/* JoiningYear */}
        <div className="field-group">
          <label htmlFor="joining-year">Joining year</label>
          <input
            id="joining-year"
            type="number"
            name="JoiningYear"
            min={2010}
            max={2025}
            value={form.JoiningYear}
            onChange={handleChange}
            className={fieldClass}
            required
          />
        </div>

        {/* PaymentTier */}
        <div className="field-group">
          <label htmlFor="payment-tier">Payment tier</label>
          <select id="payment-tier" name="PaymentTier" value={form.PaymentTier} onChange={handleChange} className={fieldClass}>
            <option value={1}>1 (Lowest)</option>
            <option value={2}>2</option>
            <option value={3}>3 (Highest)</option>
          </select>
        </div>

        {/* Age */}
        <div className="field-group">
          <label htmlFor="age">Age</label>
          <input
            id="age"
            type="number"
            name="Age"
            min={18}
            max={70}
            value={form.Age}
            onChange={handleChange}
            className={fieldClass}
            required
          />
        </div>

        {/* Experience */}
        <div className="field-group">
          <label htmlFor="experience">Experience in current domain</label>
          <input
            id="experience"
            type="number"
            name="ExperienceInCurrentDomain"
            min={0}
            max={20}
            value={form.ExperienceInCurrentDomain}
            onChange={handleChange}
            className={fieldClass}
            required
          />
          <span className="field-hint">Years</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="submit-button"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Running assessment...
          </span>
        ) : (
          <>Run assessment <span aria-hidden="true">→</span></>
        )}
      </button>
    </form>
  )
}
