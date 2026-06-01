export interface MockPrivyUser {
  id: string
  email: string
  name: string
  company: string
  createdAt: string
}

export const MOCK_USERS: MockPrivyUser[] = [
  {
    id: 'did:privy:mock-cfo-001',
    email: 'cfo@empresa.mx',
    name: 'Carlos Mendoza',
    company: 'Manufacturas del Norte S.A.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'did:privy:mock-cfo-002',
    email: 'tesorero@startup.mx',
    name: 'Ana García',
    company: 'TechStartup MX S.A.P.I.',
    createdAt: new Date().toISOString(),
  },
]

export function getMockSession() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('fluxo_session')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function setMockSession(user: MockPrivyUser) {
  localStorage.setItem('fluxo_session', JSON.stringify(user))
}

export function clearMockSession() {
  localStorage.removeItem('fluxo_session')
}
