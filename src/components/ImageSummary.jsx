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
    <section>
      <h3>Master details</h3>
      <p>Type: {displayType}</p>
      <p>File name: {meta.name}</p>
      <p>
        Dimensions: {meta.width} x {meta.height}px (about {logicalWidth} x {logicalHeight}px at 1x)
      </p>
      <p>Size: {meta.prettySize}</p>
      {meta.previewUrl && (
        <figure>
          <img src={meta.previewUrl} alt={`Preview of ${meta.name}`} loading="lazy" />
          <figcaption>Preview</figcaption>
        </figure>
      )}
    </section>
  )
}

export default ImageSummary
