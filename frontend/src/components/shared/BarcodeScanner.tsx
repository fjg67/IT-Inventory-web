/**
 * BarcodeScanner — Composant de scan de code-barres via la caméra.
 * Utilise html5-qrcode pour décoder EAN13, Code128, QR, etc.
 * Affiche un overlay premium avec animation de scan.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, Zap } from 'lucide-react'

interface BarcodeScannerProps {
  /** Appelé quand un code-barres est détecté */
  onScan: (code: string) => void
  /** Fermer le scanner */
  onClose: () => void
}

// Ligne de scan animée
function ScanLineAnimation() {
  return (
    <motion.div
      className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full shadow-[0_0_12px_rgba(59,130,246,0.6)]"
      initial={{ top: '15%' }}
      animate={{ top: ['15%', '85%', '15%'] }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(true)
  const hasScanned = useRef(false)

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current) {
        const state = scannerRef.current.getState()
        // State 2 = SCANNING
        if (state === 2) {
          await scannerRef.current.stop()
        }
        scannerRef.current.clear()
        scannerRef.current = null
      }
    } catch {
      // Silently ignore stop errors
    }
  }, [])

  useEffect(() => {
    const readerId = 'barcode-reader-container'
    let mounted = true

    const startScanner = async () => {
      try {
        const html5Qrcode = new Html5Qrcode(readerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
          verbose: false,
        })

        scannerRef.current = html5Qrcode

        await html5Qrcode.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: 280, height: 160 },
            aspectRatio: 1.5,
            disableFlip: false,
          },
          (decodedText) => {
            if (!hasScanned.current && mounted) {
              hasScanned.current = true
              // Vibration feedback si supporté
              if (navigator.vibrate) {
                navigator.vibrate(100)
              }
              onScan(decodedText)
            }
          },
          () => {
            // QR code not found — ignore silently
          }
        )

        if (mounted) {
          setIsStarting(false)
        }
      } catch (err) {
        if (mounted) {
          setIsStarting(false)
          if (err instanceof Error) {
            if (err.message.includes('Permission') || err.message.includes('NotAllowed')) {
              setError('Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.')
            } else if (err.message.includes('NotFound') || err.message.includes('DevicesNotFound')) {
              setError('Aucune caméra détectée sur cet appareil.')
            } else {
              setError(`Erreur caméra: ${err.message}`)
            }
          } else {
            setError('Impossible de démarrer la caméra.')
          }
        }
      }
    }

    startScanner()

    return () => {
      mounted = false
      stopScanner()
    }
  }, [onScan, stopScanner])

  const handleClose = useCallback(() => {
    stopScanner().then(() => onClose())
  }, [stopScanner, onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Card container */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1222] shadow-2xl shadow-black/50">
            {/* Header */}
            <div className="relative flex items-center justify-between px-5 py-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
              
              <div className="relative flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                  <Camera className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Scanner un code-barres</h3>
                  <p className="text-[10px] text-white/40">Placez le code face à la caméra</p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition-all"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>
            </div>

            {/* Camera view */}
            <div className="relative bg-black" ref={containerRef}>
              {/* Scanner container */}
              <div
                id="barcode-reader-container"
                className="w-full [&>video]:!rounded-none [&>video]:!object-cover [&_#qr-shaded-region]:!border-blue-500/30"
                style={{ minHeight: 300 }}
              />

              {/* Scan frame overlay */}
              {!error && !isStarting && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Corner markers */}
                  <div className="relative w-[280px] h-[160px]">
                    {/* Top-left */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-400 rounded-tl-lg" />
                    {/* Top-right */}
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr-lg" />
                    {/* Bottom-left */}
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl-lg" />
                    {/* Bottom-right */}
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-400 rounded-br-lg" />
                    
                    {/* Animated scan line */}
                    <ScanLineAnimation />
                  </div>
                </div>
              )}

              {/* Loading state */}
              {isStarting && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Zap className="h-8 w-8 text-blue-400" />
                  </motion.div>
                  <p className="text-sm text-white/60">Démarrage de la caméra…</p>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 ring-1 ring-rose-500/20">
                    <Camera className="h-6 w-6 text-rose-400" />
                  </div>
                  <p className="text-sm text-white/70 text-center leading-relaxed">{error}</p>
                  <button
                    onClick={handleClose}
                    className="mt-2 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-sm text-white/60 transition-all"
                  >
                    Fermer
                  </button>
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 border-t border-white/[0.06] bg-white/[0.02]">
              <p className="text-[10px] text-center text-white/30">
                Supporte EAN-13, EAN-8, Code128, Code39, UPC-A, QR Code
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
