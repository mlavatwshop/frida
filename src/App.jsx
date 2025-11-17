import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Container, Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import pica from 'pica'
import PageHero from './components/PageHero'
import UploadPanel from './components/UploadPanel'
import ImageSummary from './components/ImageSummary'
import VariantGrid from './components/VariantGrid'

// The source image is treated as a 3x asset, so all target scales are relative to this baseline.
const SCALE_REFERENCE = 3
const TARGET_SCALES = [
  { label: '2x', factor: 2 },
  { label: '1.5x', factor: 1.5 },
  { label: '1x', factor: 1 },
]

// Byte formatter helper keeps rendering logic tidy.
const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes)) return 'n/a'
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** exponent
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`
}

// Utility that turns a canvas into a Blob while giving us Promise ergonomics.
const canvasToBlob = (canvas, mimeType, quality) =>
  new Promise((resolve, reject) => {
    console.log(`[canvasToBlob] Converting canvas (${canvas.width}x${canvas.height}) to ${mimeType}`, quality ? `quality: ${quality}` : '')
    const startTime = performance.now()
    
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const duration = (performance.now() - startTime).toFixed(2)
          console.log(`[canvasToBlob] ✓ Blob created: ${formatBytes(blob.size)} in ${duration}ms`)
          resolve(blob)
        } else {
          console.error('[canvasToBlob] ✗ Canvas could not produce a blob')
          reject(new Error('Canvas could not produce a blob'))
        }
      },
      mimeType,
      quality,
    )
  })

// Small helper that loads an Image object so we can read its natural dimensions.
const loadImage = (src) =>
  new Promise((resolve, reject) => {
    console.log('[loadImage] Loading image from blob URL...')
    const startTime = performance.now()
    
    const image = new Image()
    image.onload = () => {
      const duration = (performance.now() - startTime).toFixed(2)
      console.log(`[loadImage] ✓ Image loaded: ${image.naturalWidth}x${image.naturalHeight} in ${duration}ms`)
      resolve(image)
    }
    image.onerror = () => {
      console.error('[loadImage] ✗ Image failed to decode')
      reject(new Error('The selected image could not be decoded'))
    }
    image.src = src
  })

function App() {
  const [imageMeta, setImageMeta] = useState(null)
  const [variants, setVariants] = useState([])
  const [busy, setBusy] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Refs keep track of resources we must clean up manually to avoid leaking object URLs.
  const previewUrlRef = useRef(null)
  const generatedUrlsRef = useRef([])

  // Instantiate Pica only once -- it does internal memoization and reusing it gives better performance.
  const picaInstance = useMemo(() => {
    console.log('[Pica] Initializing Pica instance for high-quality image resizing')
    return pica()
  }, [])

  const releasePreview = useCallback(() => {
    if (previewUrlRef.current) {
      console.log('[Cleanup] Revoking preview object URL')
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
  }, [])

  const releaseVariantUrls = useCallback(() => {
    if (generatedUrlsRef.current.length > 0) {
      console.log(`[Cleanup] Revoking ${generatedUrlsRef.current.length} variant object URLs`)
      generatedUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      generatedUrlsRef.current = []
    }
  }, [])

  // Clean up when React tears down the component.
  useEffect(() => {
    return () => {
      releasePreview()
      releaseVariantUrls()
    }
  }, [releasePreview, releaseVariantUrls])

  // Convert canvas to WebP format for modern web-optimized images.
  const convertToWebP = useCallback(async (canvas) => {
    console.log(`[WebP] Converting canvas (${canvas.width}x${canvas.height}) to WebP...`)
    const startTime = performance.now()
    
    const webpBlob = await canvasToBlob(canvas, 'image/webp', 0.9)
    
    const duration = (performance.now() - startTime).toFixed(2)
    console.log(`[WebP] ✓ Conversion complete: ${formatBytes(webpBlob.size)} in ${duration}ms`)
    
    return webpBlob
  }, [])

  const createFileEntry = useCallback((format, mime, blob, scaleLabel, originalName) => {
    const baseName = originalName.replace(/\.[^/.]+$/, '') || 'frida-asset'
    const extension = format === 'JPEG' ? 'jpg' : format.toLowerCase()
    const suggestedName = `${baseName}-${scaleLabel}.${extension}`
    const url = URL.createObjectURL(blob)
    generatedUrlsRef.current.push(url)

    return {
      format,
      mime,
      size: blob.size,
      prettySize: formatBytes(blob.size),
      url,
      suggestedName,
    }
  }, [])

  const handleSelectFile = useCallback(
    async (file) => {
      if (!file) return

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('[Frida] 🎬 Starting image processing pipeline')
      console.log(`[File] Name: ${file.name}`)
      console.log(`[File] Type: ${file.type}`)
      console.log(`[File] Size: ${formatBytes(file.size)}`)
      
      const pipelineStart = performance.now()

      setBusy(true)
      setErrorMessage('')
      setVariants([])
      setStatusMessage('Loading image...')

      // Ensure we release previously allocated resources before spinning up new work.
      releasePreview()
      releaseVariantUrls()

      try {
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select an image file.')
        }

        const previewUrl = URL.createObjectURL(file)
        previewUrlRef.current = previewUrl

        const imageElement = await loadImage(previewUrl)

        const baseCanvas = document.createElement('canvas')
        baseCanvas.width = imageElement.naturalWidth
        baseCanvas.height = imageElement.naturalHeight
        const ctx = baseCanvas.getContext('2d')
        if (!ctx) {
          throw new Error('Your browser does not support the Canvas 2D API.')
        }
        
        console.log(`[Canvas] Drawing source image to base canvas (${baseCanvas.width}x${baseCanvas.height})`)
        ctx.drawImage(imageElement, 0, 0)

        const masterMeta = {
          name: file.name,
          type: file.type,
          size: file.size,
          prettySize: formatBytes(file.size),
          width: imageElement.naturalWidth,
          height: imageElement.naturalHeight,
          previewUrl,
        }
        setImageMeta(masterMeta)

        console.log(`[Processing] Generating ${TARGET_SCALES.length} scale variants (${TARGET_SCALES.map(s => s.label).join(', ')})`)
        const nextVariants = []

        for (const scale of TARGET_SCALES) {
          console.log(`\n[Scale ${scale.label}] Starting generation...`)
          setStatusMessage(`Generating ${scale.label} assets...`)

          const width = Math.max(1, Math.round(masterMeta.width * (scale.factor / SCALE_REFERENCE)))
          const height = Math.max(1, Math.round(masterMeta.height * (scale.factor / SCALE_REFERENCE)))

          console.log(`[Scale ${scale.label}] Target dimensions: ${width}x${height}`)

          const targetCanvas = document.createElement('canvas')
          targetCanvas.width = width
          targetCanvas.height = height

          // Pica handles color management + interpolation, so resized assets remain crisp.
          console.log(`[Scale ${scale.label}] Resizing with Pica (quality: 3, alpha: true)...`)
          const resizeStart = performance.now()
          await picaInstance.resize(baseCanvas, targetCanvas, {
            quality: 3,
            alpha: true,
          })
          const resizeDuration = (performance.now() - resizeStart).toFixed(2)
          console.log(`[Scale ${scale.label}] ✓ Resize complete in ${resizeDuration}ms`)

          console.log(`[Scale ${scale.label}] Generating PNG...`)
          const pngBlob = await canvasToBlob(targetCanvas, 'image/png')
          
          console.log(`[Scale ${scale.label}] Generating JPEG (quality: 0.92)...`)
          const jpegBlob = await canvasToBlob(targetCanvas, 'image/jpeg', 0.92)
          
          console.log(`[Scale ${scale.label}] Generating WebP...`)
          const webpBlob = await convertToWebP(targetCanvas)

          nextVariants.push({
            label: scale.label,
            width,
            height,
            files: [
              createFileEntry('PNG', 'image/png', pngBlob, scale.label, masterMeta.name),
              createFileEntry('JPEG', 'image/jpeg', jpegBlob, scale.label, masterMeta.name),
              createFileEntry('WebP', 'image/webp', webpBlob, scale.label, masterMeta.name),
            ],
          })
          
          console.log(`[Scale ${scale.label}] ✓ All formats generated (PNG: ${formatBytes(pngBlob.size)}, JPEG: ${formatBytes(jpegBlob.size)}, WebP: ${formatBytes(webpBlob.size)})`)
        }

        setVariants(nextVariants)
        
        const totalDuration = ((performance.now() - pipelineStart) / 1000).toFixed(2)
        const totalFiles = nextVariants.length * 3
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log(`[Frida] ✅ Processing complete! ${totalFiles} files generated in ${totalDuration}s`)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
        
        setStatusMessage('All variants are ready to download!')
      } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('[Frida] ❌ Processing failed')
        console.error('[Error]', error)
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
        
        setErrorMessage(error.message || 'Something went wrong while processing the image.')
        setImageMeta(null)
        setStatusMessage('Processing failed -- please try another file.')
      } finally {
        setBusy(false)
      }
    },
    [
      convertToWebP,
      createFileEntry,
      picaInstance,
      releasePreview,
      releaseVariantUrls,
    ],
  )

  const handleDownload = useCallback((file) => {
    // Placeholder for analytics hooks; keeping it here makes future enhancements trivial.
    console.log(`[Download] 📥 User downloading: ${file.suggestedName} (${file.prettySize})`)
  }, [])

  const handleDownloadAll = useCallback((files) => {
    console.log(`[Download All] 📦 User initiated batch download of ${files.length} files`)
  }, [])

  return (
    <>
      <PageHero />

      {errorMessage && (
        <Container size="lg" py="md">
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Processing failed" 
            color="red"
            variant="filled"
          >
            {errorMessage}
          </Alert>
        </Container>
      )}

      <UploadPanel busy={busy} statusMessage={statusMessage} onSelectFile={handleSelectFile} />

      <ImageSummary meta={imageMeta} />
      <VariantGrid
        variants={variants}
        onDownload={handleDownload}
        onDownloadAll={handleDownloadAll}
        emptyState="Upload a 3x master to see freshly minted variants."
      />
    </>
  )
}

export default App
