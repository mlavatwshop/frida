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
    <article>
      <header>
        <h3>Master details</h3>
      </header>
      <dl>
        <dt>Type</dt>
        <dd>{displayType}</dd>
        <dt>File name</dt>
        <dd>{meta.name}</dd>
        <dt>Dimensions</dt>
        <dd>
          {meta.width} × {meta.height}px <small>(about {logicalWidth} × {logicalHeight}px at 1x)</small>
        </dd>
        <dt>Size</dt>
        <dd>{meta.prettySize}</dd>
      </dl>
      {meta.previewUrl && (
        <figure>
          <img 
            src={meta.previewUrl} 
            alt={`Preview of ${meta.name}`} 
            loading="lazy"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          <figcaption>Preview</figcaption>
        </figure>
      )}
    </article>
  )
}

export default ImageSummary
