/**
 * Renders a list of generated variants. Each variant lists the formats that are ready to download.
 */
const VariantGrid = ({ variants, onDownload, emptyState }) => {
  if (!variants.length) {
    return (
      <section>
        <p>{emptyState}</p>
      </section>
    )
  }

  return (
    <section>
      {variants.map((variant) => (
        <article key={variant.label}>
          <h3>{variant.label}</h3>
          <p>
            Pixels: {variant.width} x {variant.height}
          </p>
          <ul>
            {variant.files.map((file) => (
              <li key={`${variant.label}-${file.format}`}>
                <p>
                  {file.format} ({file.mime}) -- {file.prettySize}
                </p>
                <a
                  href={file.url}
                  download={file.suggestedName}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onDownload(file)}
                >
                  Download {file.format}
                </a>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  )
}

export default VariantGrid
