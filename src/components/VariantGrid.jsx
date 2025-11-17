/**
 * Renders a list of generated variants. Each variant lists the formats that are ready to download.
 */
const VariantGrid = ({ variants, onDownload, emptyState }) => {
  if (!variants.length) {
    return (
      <wa-card className="panel-card">
        <div className="variant-empty">
          <wa-icon name="sparkles" size="lg" />
          <p>{emptyState}</p>
        </div>
      </wa-card>
    )
  }

  return (
    <div className="variant-grid">
      {variants.map((variant) => (
        <wa-card key={variant.label} className="panel-card variant-card">
          <div className="variant-card__header">
            <div>
              <p className="summary-label">Scale</p>
              <h3>{variant.label}</h3>
            </div>
            <div className="variant-card__dims">
              <p className="summary-label">Pixels</p>
              <p className="summary-value">
                {variant.width} x {variant.height}
              </p>
            </div>
          </div>

          <div className="variant-card__formats">
            {variant.files.map((file) => (
              <div key={`${variant.label}-${file.format}`} className="variant-card__row">
                <div>
                  <strong>{file.format}</strong>
                  <p>{file.mime}</p>
                  <small>{file.prettySize}</small>
                </div>
                {/* wa-button doubles as an anchor so we can feed it download metadata */}
                <wa-button
                  variant="neutral"
                  appearance="outlined"
                  size="small"
                  href={file.url}
                  download={file.suggestedName}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onDownload(file)}
                >
                  <wa-icon slot="start" name="download" />
                  Download
                </wa-button>
              </div>
            ))}
          </div>
        </wa-card>
      ))}
    </div>
  )
}

export default VariantGrid
