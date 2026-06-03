'use client'

import { useState } from 'react'
import { Zap, ArrowRight, Loader2, Shield, TrendingUp, Fingerprint, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ThemeToggle from '@/components/ui/theme-toggle'

const FEATURES = [
  { icon: Shield,      text: 'Capital protegido de la devaluación' },
  { icon: TrendingUp,  text: 'Hasta 8% anual sobre liquidez ociosa' },
  { icon: Fingerprint, text: 'Acceso sin contraseña, solo tu email' },
]

type Step = 'form' | 'sent'
type Mode = 'login' | 'register'

export default function LoginPage() {
  const [mode, setMode]   = useState<Mode>('login')
  const [step, setStep]   = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Campos
  const [email, setEmail]         = useState('')
  const [company, setCompany]     = useState('')
  const [rfc, setRfc]             = useState('')
  const [industry, setIndustry]   = useState('')

  async function handleSubmit() {
    if (!email || !email.includes('@')) { setError('Ingresa un email válido'); return }
    if (mode === 'register' && !company) { setError('Ingresa el nombre de tu empresa'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()

    if (mode === 'register') {
      // Registrar: guardar datos de empresa en metadata
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { company_name: company, rfc, industry },
        },
      })
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      // Login normal
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (err) { setError(err.message); setLoading(false); return }
    }

    setLoading(false)
    setStep('sent')
  }

  function switchMode(m: Mode) {
    setMode(m)
    setStep('form')
    setError('')
    setEmail('')
    setCompany('')
    setRfc('')
    setIndustry('')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>

      {/* Left panel — desktop */}
      <div style={{
        display: 'none', width: '50%',
        flexDirection: 'column', justifyContent: 'space-between',
        padding: '3rem', background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }} className="lg-panel">
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--neon)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="#06100A" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--txt)', letterSpacing: '-0.02em' }}>Fluxo</span>
        </div>
        <div>
          <p style={{ fontSize: 13, color: 'var(--neon)', fontWeight: 600, marginBottom: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Smart Treasury Management</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: 'var(--txt)', lineHeight: 1.15, marginBottom: '2rem', letterSpacing: '-0.025em' }}>
            Tu tesorería<br />trabajando,<br />
            <span style={{ color: 'var(--neon)' }}>mientras tú diriges.</span>
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--neon-muted)', border: '1px solid var(--neon-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color="var(--neon)" />
                </div>
                <span style={{ fontSize: 14, color: 'var(--txt2)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--txt3)' }}>Fluxo · MVP v0.1 · Para PyMEs Mexicanas</p>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <ThemeToggle />
        </div>

        <div style={{ width: '100%', maxWidth: 400 }} className="animate-fade-up">

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--neon)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#06100A" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--txt)', letterSpacing: '-0.02em' }}>Fluxo</span>
          </div>

          {step === 'form' ? (
            <>
              {/* Toggle login/register */}
              <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: 12, padding: '0.25rem', marginBottom: '2rem', border: '1px solid var(--border)' }}>
                {(['login', 'register'] as Mode[]).map(m => (
                  <button key={m} onClick={() => switchMode(m)} style={{
                    flex: 1, height: 38, borderRadius: 9, border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: mode === m ? 600 : 400,
                    background: mode === m ? 'var(--bg2)' : 'transparent',
                    color: mode === m ? 'var(--txt)' : 'var(--txt3)',
                    boxShadow: mode === m ? 'var(--shadow-card)' : 'none',
                    transition: 'all 0.15s',
                  }}>
                    {m === 'login' ? 'Entrar' : 'Crear cuenta'}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--txt)', letterSpacing: '-0.025em', marginBottom: '0.3rem' }}>
                  {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--txt2)' }}>
                  {mode === 'login'
                    ? 'Ingresa tu email y te enviamos un enlace de acceso.'
                    : 'Registra tu empresa y empieza a generar rendimiento.'}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
                {/* Email — siempre visible */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--txt2)', marginBottom: '0.4rem' }}>
                    Email empresarial
                  </label>
                  <input
                    type="email"
                    placeholder="cfo@tuempresa.mx"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    style={{
                      width: '100%', height: 46, padding: '0 1rem',
                      background: 'var(--bg2)', border: `1px solid ${error && !email ? 'var(--red)' : 'var(--border)'}`,
                      borderRadius: 12, fontSize: 14, color: 'var(--txt)', outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--neon-border)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                {/* Campos extra solo en registro */}
                {mode === 'register' && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--txt2)', marginBottom: '0.4rem' }}>
                        Razón social <span style={{ color: 'var(--red)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Manufacturas del Norte S.A. de C.V."
                        value={company}
                        onChange={e => { setCompany(e.target.value); setError('') }}
                        style={{
                          width: '100%', height: 46, padding: '0 1rem',
                          background: 'var(--bg2)', border: '1px solid var(--border)',
                          borderRadius: 12, fontSize: 14, color: 'var(--txt)', outline: 'none',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--neon-border)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--txt2)', marginBottom: '0.4rem' }}>RFC</label>
                        <input
                          type="text"
                          placeholder="MNO123456ABC"
                          value={rfc}
                          onChange={e => setRfc(e.target.value.toUpperCase())}
                          style={{
                            width: '100%', height: 46, padding: '0 1rem',
                            background: 'var(--bg2)', border: '1px solid var(--border)',
                            borderRadius: 12, fontSize: 14, color: 'var(--txt)', outline: 'none',
                          }}
                          onFocus={e => e.target.style.borderColor = 'var(--neon-border)'}
                          onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--txt2)', marginBottom: '0.4rem' }}>Industria</label>
                        <input
                          type="text"
                          placeholder="Manufactura"
                          value={industry}
                          onChange={e => setIndustry(e.target.value)}
                          style={{
                            width: '100%', height: 46, padding: '0 1rem',
                            background: 'var(--bg2)', border: '1px solid var(--border)',
                            borderRadius: 12, fontSize: 14, color: 'var(--txt)', outline: 'none',
                          }}
                          onFocus={e => e.target.style.borderColor = 'var(--neon-border)'}
                          onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {error && (
                <p style={{ fontSize: 13, color: 'var(--red)', marginBottom: '0.875rem', padding: '0.6rem 0.875rem', background: 'rgba(204,42,64,0.07)', borderRadius: 8, border: '1px solid rgba(204,42,64,0.18)' }}>
                  {error}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-neon"
                style={{ width: '100%', height: 48, border: 'none', borderRadius: 12, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" />Enviando enlace...</>
                  : <>{mode === 'login' ? 'Enviar enlace de acceso' : 'Crear cuenta'} <ArrowRight size={16} /></>
                }
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--neon-muted)', border: '1px solid var(--neon-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CheckCircle2 size={30} color="var(--neon)" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--txt)', letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
                Revisa tu email
              </h2>
              <p style={{ fontSize: 14, color: 'var(--txt2)', lineHeight: 1.7, marginBottom: '2rem' }}>
                Enviamos un enlace de acceso a<br />
                <strong style={{ color: 'var(--txt)' }}>{email}</strong>
              </p>
              <p style={{ fontSize: 13, color: 'var(--txt3)' }}>
                ¿No llegó?{' '}
                <button onClick={() => setStep('form')} style={{ background: 'none', border: 'none', color: 'var(--neon)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  Reenviar
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) { .lg-panel { display: flex !important; } }
      `}</style>
    </div>
  )
}