import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, DM_Sans } from 'next/font/google'
import './globals.css'

// Reemplazamos Syne por Plus Jakarta Sans para un look moderno, limpio y premium
const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'], 
  variable: '--font-display', 
  weight: ['600', '700', '800'] 
})

const dmSans = DM_Sans({ 
  subsets: ['latin'], 
  variable: '--font-body', 
  weight: ['400', '500', '600'] 
})

export const metadata: Metadata = {
  title: 'Fluxo — Smart Treasury',
  description: 'Gestión inteligente de tesorería para PyMEs Mexicanas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function(){
              try {
                var t = localStorage.getItem('fluxo-theme');
                if (t === 'light') { document.documentElement.classList.remove('dark'); }
                else { document.documentElement.classList.add('dark'); }
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body
        className={`${plusJakarta.variable} ${dmSans.variable} antialiased`}
        style={{ fontFamily: 'var(--font-body), sans-serif' }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}