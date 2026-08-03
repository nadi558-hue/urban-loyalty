'use client'

import { useState } from 'react'
import { Cake, TickCircle } from 'iconsax-reactjs'
import { saveBirthDate } from './actions'

const HE_MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']

function label(date: string): string {
  const [, m, d] = date.split('-').map(Number)
  return `${d} ב${HE_MONTHS[m - 1]}`
}

export default function BirthdayField({ current, bonus }: { current: string | null; bonus: number }) {
  const [value, setValue] = useState(current ?? '')
  const [saved, setSaved] = useState(!!current)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function save(next: string) {
    setValue(next)
    setSaved(false)
    setError('')
    if (!next) return
    setBusy(true)
    const res = await saveBirthDate(next)
    setBusy(false)
    if (res.ok) setSaved(true)
    else setError(res.error ?? 'שמירה נכשלה')
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
        <Cake size={19} variant="Bulk" color="#C0906F" />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 14.5, color: '#3B2E27', fontFamily: 'var(--font-assistant,sans-serif)' }}>יום הולדת</p>
          <p style={{ fontSize: 12.5, color: saved ? '#3f8f5e' : '#9C8B7F', fontFamily: 'var(--font-assistant,sans-serif)' }}>
            {error
              ? error
              : busy ? 'שומר…'
              : saved && value ? `${label(value)} · ${bonus} UC מתנה בכל שנה`
              : `הוסיפו תאריך וקבלו ${bonus} UC מתנה בכל שנה`}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {saved && !busy && <TickCircle size={17} variant="Bulk" color="#3f8f5e" />}
        <input
          type="date"
          value={value}
          max={new Date().toISOString().slice(0, 10)}
          onChange={e => save(e.target.value)}
          aria-label="תאריך לידה"
          style={{
            border: 'none', background: 'rgba(255,255,255,0.7)',
            borderRadius: 10, padding: '7px 9px',
            fontSize: 14, color: '#3B2E27', fontFamily: 'var(--font-assistant,sans-serif)',
            boxShadow: 'inset 0 2px 5px -2px rgba(150,110,85,0.3)',
          }}
        />
      </div>
    </div>
  )
}
