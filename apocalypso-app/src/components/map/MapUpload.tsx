import { useCallback } from 'react'

interface MapUploadProps {
  onUpload: (imageUrl: string, width: number, height: number, file?: File) => void
}

export default function MapUpload({ onUpload }: MapUploadProps) {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      processFile(file)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [])

  function processFile(file: File) {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      onUpload(url, img.naturalWidth, img.naturalHeight, file)
    }
    img.src = url
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="absolute inset-0 flex items-center justify-center"
    >
      <label className="cursor-pointer flex flex-col items-center gap-4 p-12 border-2 border-dashed border-slate-700 hover:border-violet-500/50 rounded-2xl transition group">
        <div className="w-16 h-16 flex items-center justify-center bg-slate-800 group-hover:bg-slate-700 rounded-xl transition">
          <span className="text-3xl text-slate-500 group-hover:text-violet-400">+</span>
        </div>
        <div className="text-center">
          <p className="text-slate-400 group-hover:text-slate-300 transition">
            Drop a map image here
          </p>
          <p className="text-xs text-slate-600 mt-1">or click to browse (PNG, JPG)</p>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </label>
    </div>
  )
}
