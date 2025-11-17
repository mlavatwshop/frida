import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import pica from 'pica'
import { FFmpeg } from '@ffmpeg/ffmpeg'
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
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
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
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('The selected image could not be decoded'))
    image.src = src
  })

function App() {
  const [imageMeta, setImageMeta] = useState(null)
  const [variants, setVariants] = useState([])
  const [busy, setBusy] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Refs keep track of resources we must clean up manually to avoid leaking object URLs + wasm instances.
  const previewUrlRef = useRef(null)
  const generatedUrlsRef = useRef([])
  const ffmpegRef = useRef(null)

  // Instantiate Pica only once -- it does internal memoization and reusing it gives better performance.
  const picaInstance = useMemo(() => pica(), [])

  const releasePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
  }, [])

  const releaseVariantUrls = useCallback(() => {
    generatedUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    generatedUrlsRef.current = []
  }, [])

  // Clean up when React tears down the component.
  useEffect(() => {
    return () => {
      releasePreview()
      releaseVariantUrls()
    }
  }, [releasePreview, releaseVariantUrls])

  // Lazily load ffmpeg.wasm because it is a chunky dependency.
  const ensureFfmpeg = useCallback(async () => {
    if (ffmpegRef.current) {
      return ffmpegRef.current
    }

    const ffmpeg = new FFmpeg()
    await ffmpeg.load()
    ffmpegRef.current = ffmpeg
    return ffmpeg
  }, [])

  // Convert a still PNG (lossless) into a looping WEBM so designers can hand-off motion-ready assets.
  const convertStillToWebM = useCallback(
    async (blob) => {
      const ffmpeg = await ensureFfmpeg()
      const inputName = `source-${Date.now()}.png`
      const outputName = `output-${Date.now()}.webm`

      await ffmpeg.writeFile(inputName, new Uint8Array(await blob.arrayBuffer()))

      await ffmpeg.exec([
        '-loop',
        '1',
        '-i',
        inputName,
        '-t',
        '1',
        '-c:v',
        'libvpx-vp9',
        '-pix_fmt',
        'yuva420p',
        '-b:v',
        '1M',
        outputName,
      ])

      const data = await ffmpeg.readFile(outputName)
      await ffmpeg.deleteFile(inputName)
      await ffmpeg.deleteFile(outputName)

      return new Blob([data.buffer], { type: 'video/webm' })
    },
    [ensureFfmpeg],
  )

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

        const nextVariants = []

        for (const scale of TARGET_SCALES) {
          setStatusMessage(`Generating ${scale.label} assets...`)

          const width = Math.max(1, Math.round(masterMeta.width * (scale.factor / SCALE_REFERENCE)))
          const height = Math.max(1, Math.round(masterMeta.height * (scale.factor / SCALE_REFERENCE)))

          const targetCanvas = document.createElement('canvas')
          targetCanvas.width = width
          targetCanvas.height = height

          // Pica handles color management + interpolation, so resized assets remain crisp.
          await picaInstance.resize(baseCanvas, targetCanvas, {
            quality: 3,
            alpha: true,
          })

          const pngBlob = await canvasToBlob(targetCanvas, 'image/png')
          const jpegBlob = await canvasToBlob(targetCanvas, 'image/jpeg', 0.92)
          const webmBlob = await convertStillToWebM(pngBlob)

          nextVariants.push({
            label: scale.label,
            width,
            height,
            files: [
              createFileEntry('PNG', 'image/png', pngBlob, scale.label, masterMeta.name),
              createFileEntry('JPEG', 'image/jpeg', jpegBlob, scale.label, masterMeta.name),
              createFileEntry('WEBM', 'video/webm', webmBlob, scale.label, masterMeta.name),
            ],
          })
        }

        setVariants(nextVariants)
        setStatusMessage('All variants are ready to download!')
      } catch (error) {
        console.error(error)
        setErrorMessage(error.message || 'Something went wrong while processing the image.')
        setImageMeta(null)
        setStatusMessage('Processing failed -- please try another file.')
      } finally {
        setBusy(false)
      }
    },
    [
      convertStillToWebM,
      createFileEntry,
      picaInstance,
      releasePreview,
      releaseVariantUrls,
    ],
  )

  const handleDownload = useCallback((file) => {
    // Placeholder for analytics hooks; keeping it here makes future enhancements trivial.
    console.info(`Downloading ${file.suggestedName}`)
  }, [])

  return (
    <main>
      <PageHero />

      {errorMessage && (
        <section>
          <strong>Processing failed</strong>
          <p>{errorMessage}</p>
        </section>
      )}

      <UploadPanel busy={busy} statusMessage={statusMessage} onSelectFile={handleSelectFile} />

      <section>
        <ImageSummary meta={imageMeta} />
        <VariantGrid
          variants={variants}
          onDownload={handleDownload}
          emptyState="Upload a 3x master to see freshly minted variants."
        />
      </section>
    </main>
  )
}

export default App
