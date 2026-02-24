// Premium drag & drop photo upload zone
// Blueprint Forge design — dashed border, hover glow, preview with remove

import { Camera, ImageIcon, X, Upload } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface PhotoUploadZoneProps {
  preview: string | null
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
}

export function PhotoUploadZone({ preview, onFileSelect, onRemove }: PhotoUploadZoneProps) {
  return (
    <AnimatePresence mode="wait">
      {preview ? (
        <motion.div
          key="preview"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative rounded-xl overflow-hidden border border-border ring-1 ring-border group"
        >
          <img
            src={preview}
            alt="Aperçu"
            className="w-full h-48 object-contain bg-surface"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          {/* Remove button */}
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2.5 right-2.5 p-2 rounded-lg bg-black/50 backdrop-blur-sm text-text-primary hover:bg-red-500/80 hover:text-white transition-all opacity-0 group-hover:opacity-100 active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>
          {/* File info badge */}
          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-text-primary font-medium flex items-center gap-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <ImageIcon className="h-3 w-3" />
              Image chargée
            </span>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="upload"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-blue-500/25 hover:bg-blue-500/[0.02] transition-all duration-300 group"
        >
          {/* Blueprint grid background */}
          <div
            className="absolute inset-0 rounded-xl opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative">
            {/* Upload icon with glow */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface border border-border flex items-center justify-center group-hover:bg-blue-500/[0.08] group-hover:border-blue-500/20 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.08)]">
              <Upload className="h-7 w-7 text-text-muted group-hover:text-blue-400 transition-colors duration-300" />
            </div>

            <p className="text-sm font-semibold text-text-primary mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Ajouter une photo
            </p>
            <p className="text-xs text-text-muted mb-5">
              Glissez-déposez ou parcourez vos fichiers
            </p>

            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/10 text-blue-400 text-sm font-semibold hover:bg-blue-500/15 ring-1 ring-blue-500/20 transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] active:scale-95" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Camera className="h-4 w-4" />
              Parcourir
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onFileSelect}
              />
            </label>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
