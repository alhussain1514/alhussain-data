import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <div className="glass-card p-4 flex items-center gap-3 border-brand-blue/30"
           style={{ borderColor: 'rgba(59,130,246,0.3)' }}>
        <div className="w-10 h-10 rounded-xl bg-brand-blue/20 flex items-center justify-center flex-shrink-0">
          <Download size={18} className="text-brand-blue" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Install AL-HUSSAIN DATA</p>
          <p className="text-xs text-slate-400">Add to home screen for quick access</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleInstall}
            className="px-3 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-medium">
            Install
          </button>
          <button onClick={() => setShowBanner(false)}
            className="text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
