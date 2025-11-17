/**
 * Lightweight upload surface built around native HTML controls so the UI still works without any styling.
 */
const UploadPanel = ({ busy, statusMessage, onSelectFile }) => {
  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file && !busy) {
      onSelectFile(file)
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
    <article onDrop={handleDrop} onDragOver={handleDragOver}>
      <header>
        <h2>Drop in your 3x source</h2>
      </header>
      <p>
        Frida assumes your upload is a 3x density file. We will automatically derive lower-density siblings, keep
        metadata where possible, and display exact pixel math so you can double-check before downloading.
      </p>

      <label>
        Select an image file
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={busy} />
      </label>

      <small>Or drag the file onto this panel.</small>

      <footer>
        {busy ? (
          <p aria-busy="true">{statusMessage || 'Rendering variants...'}</p>
        ) : (
          <p>{statusMessage || 'No file selected yet.'}</p>
        )}
      </footer>
    </article>
  )
}

export default UploadPanel
