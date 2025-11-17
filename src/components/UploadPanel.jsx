import { useRef } from 'react'

/**
 * Lightweight upload surface built around the native file input.
 * We keep it in its own component so we can sprinkle comments without drowning the core logic.
 */
const UploadPanel = ({ busy, statusMessage, onSelectFile }) => {
  const inputRef = useRef(null)

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file && !busy) {
      onSelectFile(file)
    }
  }

  const handleTriggerBrowse = () => {
    if (inputRef.current && !busy) {
      inputRef.current.click()
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file && !busy) {
      onSelectFile(file)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  return (
    <wa-card className="panel-card">
      <div className="upload-panel">
        <div className="upload-copy">
          <h2>Drop in your 3x source</h2>
          <p>
            Frida assumes your upload is a 3x density file. We will automatically derive lower-density
            siblings, keep metadata where possible, and display exact pixel math so you can double-check
            before downloading.
          </p>
        </div>

        <div
          className={`dropzone ${busy ? 'dropzone--disabled' : ''}`}
          onClick={handleTriggerBrowse}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="dropzone__input"
            onChange={handleFileChange}
            disabled={busy}
          />

          <div className="dropzone__hint">
            <wa-icon name="image" size="lg" />
            <div>
              <strong>{busy ? 'Crunching pixels...' : 'Click to browse or drop a file'}</strong>
              <p>JPEG, PNG, WebP, HEIC -- anything the browser can decode.</p>
            </div>
          </div>
        </div>

        <wa-divider></wa-divider>

        <div className="upload-status">
          {busy ? (
            <>
              <wa-progress-ring indeterminate size="lg" />
              <span>{statusMessage || 'Rendering variants...'}</span>
            </>
          ) : (
            <span>{statusMessage || 'No file selected yet.'}</span>
          )}
        </div>
      </div>
    </wa-card>
  )
}

export default UploadPanel
