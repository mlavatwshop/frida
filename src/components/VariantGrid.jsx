/**
 * Renders a list of generated variants. Each variant lists the formats that are ready to download.
 */
const VariantGrid = ({ variants, onDownload, emptyState }) => {
  if (!variants.length) {
    return (
      <article>
        <p>{emptyState}</p>
      </article>
    )
  }

  return (
    <section>
      <h2>Generated Variants</h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {variants.map((variant) => (
          <article key={variant.label}>
            <header>
              <h3>{variant.label}</h3>
              <p>
                <small>
                  {variant.width} × {variant.height}px
                </small>
              </p>
            </header>
            <table>
              <thead>
                <tr>
                  <th>Format</th>
                  <th>Size</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {variant.files.map((file) => (
                  <tr key={`${variant.label}-${file.format}`}>
                    <td>
                      <strong>{file.format}</strong>
                      <br />
                      <small>{file.mime}</small>
                    </td>
                    <td>{file.prettySize}</td>
                    <td>
                      <a
                        href={file.url}
                        download={file.suggestedName}
                        role="button"
                        onClick={() => onDownload(file)}
                      >
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        ))}
      </div>
    </section>
  )
}

export default VariantGrid
