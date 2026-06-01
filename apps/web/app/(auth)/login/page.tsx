'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, ArrowRight, Loader2, Shield, TrendingUp } from 'lucide-react'
import { MOCK_USERS, setMockSession } from '@/lib/mock/privy'
import ThemeToggle from '@/components/ui/theme-toggle'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  async function handleLogin(userId: string) {
    setSelectedUser(userId)
    setLoading(true)
    const user = MOCK_USERS.find(u => u.id === userId)
    if (!user) return
    await new Promise(r => setTimeout(r, 1200))
    setMockSession(user)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 bg-gray-950 dark:bg-gray-900 border-r border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">Fluxo</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            Tu tesorería trabajando,<br />
            <span className="text-emerald-400">mientras tú diriges.</span>
          </h1>
          <div className="flex flex-col gap-4">
            {[
              { icon: Shield, text: 'Capital protegido de la devaluación' },
              { icon: TrendingUp, text: 'Hasta 8% anual sobre liquidez ociosa' },
              { icon: Zap, text: 'Automatización sin intervención manual' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-gray-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-gray-600 text-xs">Fluxo · Smart Treasury Management · MVP v0.1</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-gray-900 dark:text-white font-bold text-xl">Fluxo</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Bienvenido</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Accede con tu huella digital o Face ID. Sin contraseñas.</p>
          <div className="flex flex-col gap-2 mb-8">
            {MOCK_USERS.map(user => (
              <button key={user.id} onClick={() => handleLogin(user.id)} disabled={loading}
                className="w-full flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-gray-900 dark:hover:border-emerald-500/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 group">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  {loading && selectedUser === user.id
                    ? <Loader2 className="w-5 h-5 text-gray-600 dark:text-emerald-400 animate-spin" />
                    : <span className="text-xs font-bold text-gray-600 dark:text-emerald-400">{user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</span>}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-gray-900 dark:text-white text-sm font-medium">{user.name}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs">{user.company}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-emerald-400 transition-colors" />
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center">🔒 Modo demo · En producción: Face ID o huella digital</p>
        </div>
      </div>
    </div>
  )
}
