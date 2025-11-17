/**
 * Displays metadata for the uploaded master asset so designers can sanity-check numbers.
 */
const ImageSummary = ({ meta }) => {
  if (!meta) {
    return null
  }

  const logicalWidth = Math.round(meta.width / 3)
  const logicalHeight = Math.round(meta.height / 3)

  const displayType = meta.type ? meta.type.replace('image/', '').toUpperCase() : 'IMAGE'

  return (
    <wa-card className="panel-card image-summary">
      <div className="summary-header">
        <h3>Master details</h3>
        <wa-badge variant="neutral" pill>
          {displayType}
        </wa-badge>
      </div>

      <div className="summary-grid">
        <div>
          <p className="summary-label">File</p>
          <p className="summary-value">{meta.name}</p>
        </div>
        <div>
          <p className="summary-label">Dimensions</p>
          <p className="summary-value">
            {meta.width} x {meta.height}px
          </p>
          <small>~{logicalWidth} x {logicalHeight}px @1x</small>
        </div>
        <div>
          <p className="summary-label">Size</p>
          <p className="summary-value">{meta.prettySize}</p>
        </div>
      </div>

      {meta.previewUrl && (
        <div className="preview-frame">
          {/* Browsers isolate file URLs already, so it is safe to show the preview directly */}
          <img src={meta.previewUrl} alt={`Preview of ${meta.name}`} loading="lazy" />
        </div>
      )}
    </wa-card>
  )
}

export default ImageSummary
