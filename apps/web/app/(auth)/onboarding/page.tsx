'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Building2, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'

const STEPS = ['Empresa', 'Verificación', 'Configuración']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ legal_name: '', rfc: '', industry: '', monthly_revenue: '' })

  async function handleNext() {
    if (step < STEPS.length - 1) { setStep(s => s + 1); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }} className="animate-fade-up">

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2.5rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--neon)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="#06100A" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--txt)', letterSpacing: '-0.02em' }}>Fluxo</span>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                background: i < step ? 'var(--neon)' : i === step ? 'var(--neon-muted)' : 'var(--bg3)',
                border: `2px solid ${i < step ? 'var(--neon)' : i === step ? 'var(--neon-border)' : 'var(--border)'}`,
                color: i < step ? '#06100A' : i === step ? 'var(--neon)' : 'var(--txt3)',
                transition: 'all 0.2s',
              }}>
                {i < step ? <CheckCircle2 size={13} /> : i + 1}
              </div>
              <span style={{ fontSize: 13, color: i === step ? 'var(--txt)' : 'var(--txt3)', fontWeight: i === step ? 600 : 400 }}>{s}</span>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 1, background: i < step ? 'var(--neon)' : 'var(--border)', transition: 'background 0.3s' }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '1.75rem', marginBottom: '1rem' }}>
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--txt)', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>Cuéntanos sobre tu empresa</h2>
                <p style={{ fontSize: 14, color: 'var(--txt3)' }}>Necesitamos esta información para personalizar tu experiencia.</p>
              </div>
              {[
                { label: 'Razón social',                            key: 'legal_name',      placeholder: 'Manufacturas del Norte S.A. de C.V.' },
                { label: 'RFC',                                     key: 'rfc',             placeholder: 'MNO123456ABC' },
                { label: 'Industria',                               key: 'industry',        placeholder: 'Manufactura, Retail, Servicios...' },
                { label: 'Facturación mensual aproximada (MXN)',    key: 'monthly_revenue', placeholder: '1,000,000' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--txt2)', marginBottom: '0.4rem' }}>{label}</label>
                  <input type="text" placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{
                      width: '100%', height: 44, padding: '0 0.875rem',
                      background: 'var(--bg3)', border: '1px solid var(--border)',
                      borderRadius: 10, fontSize: 14, color: 'var(--txt)',
                      outline: 'none', transition: 'border-color 0.15s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--neon-border)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              ))}
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--neon-muted)', border: '1px solid var(--neon-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={30} color="var(--neon)" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--txt)', letterSpacing: '-0.02em' }}>Verificación de identidad</h2>
              <p style={{ fontSize: 14, color: 'var(--txt2)', textAlign: 'center', lineHeight: 1.6 }}>
                En producción, este paso conecta con el proceso KYC de Fluxo para verificar tu empresa ante la CNBV.
              </p>
              <div style={{ width: '100%', background: 'var(--neon-muted)', border: '1px solid var(--neon-border)', borderRadius: 12, padding: '0.875rem 1rem' }}>
                <p style={{ fontSize: 13, color: 'var(--neon)', textAlign: 'center', fontWeight: 600 }}>✓ Modo demo: verificación aprobada automáticamente</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--txt)', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>Casi listo</h2>
                <p style={{ fontSize: 14, color: 'var(--txt3)' }}>Estamos configurando tu cuenta de tesorería inteligente.</p>
              </div>
              {[
                'Cuenta segura creada',
                'Protocolo de rendimiento conectado',
                'CLABE virtual generada',
                'Reglas de automatización configuradas',
              ].map(text => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle2 size={18} color="var(--neon)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: 'var(--txt2)' }}>{text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleNext} disabled={loading} className="btn-neon"
          style={{ width: '100%', height: 48, border: 'none', borderRadius: 12, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Configurando tu cuenta...</>
          ) : step === STEPS.length - 1 ? (
            <>Ir al dashboard <ArrowRight size={16} /></>
          ) : (
            <>Continuar <ArrowRight size={16} /></>
          )}
        </button>
      </div>
    </div>
  )
}
