'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Building2, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { getMockSession } from '@/lib/mock/privy'

const STEPS = ['Empresa', 'Verificación', 'Configuración']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    legal_name: '',
    rfc: '',
    industry: '',
    monthly_revenue: '',
  })

  async function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-xl">Fluxo</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                i < step ? 'bg-emerald-500 text-white' :
                i === step ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500' :
                'bg-gray-800 text-gray-600'
              }`}>
                {i < step ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
              </div>
              <span className={`text-xs ${i === step ? 'text-white' : 'text-gray-600'}`}>{s}</span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px ${i < step ? 'bg-emerald-500' : 'bg-gray-800'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Cuéntanos sobre tu empresa</h2>
                <p className="text-gray-400 text-sm">Necesitamos esta información para personalizar tu experiencia.</p>
              </div>
              {[
                { label: 'Razón social', key: 'legal_name', placeholder: 'Manufacturas del Norte S.A. de C.V.' },
                { label: 'RFC', key: 'rfc', placeholder: 'MNO123456ABC' },
                { label: 'Industria', key: 'industry', placeholder: 'Manufactura, Retail, Servicios...' },
                { label: 'Facturación mensual aproximada (MXN)', key: 'monthly_revenue', placeholder: '1,000,000' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full h-11 px-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Verificación de identidad</h2>
              <p className="text-gray-400 text-sm text-center">
                En producción, este paso conecta con el proceso KYC de Fluxo para verificar tu empresa ante la CNBV.
              </p>
              <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-emerald-400 text-sm text-center font-medium">
                  ✓ Modo demo: verificación aprobada automáticamente
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Casi listo</h2>
                <p className="text-gray-400 text-sm">Estamos configurando tu cuenta de tesorería inteligente.</p>
              </div>
              {[
                { label: 'Cuenta segura creada', done: true },
                { label: 'Protocolo de rendimiento conectado', done: true },
                { label: 'CLABE virtual generada', done: true },
                { label: 'Reglas de automatización configuradas', done: true },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={loading}
          className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Configurando tu cuenta...</>
          ) : step === STEPS.length - 1 ? (
            <>Ir al dashboard <ArrowRight className="w-4 h-4" /></>
          ) : (
            <>Continuar <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  )
}