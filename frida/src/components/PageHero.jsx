// The hero is split into its own component so App.jsx stays focused on data flow.
// Keeping layout + copy isolated makes it easy to iterate on the welcome experience later.
const PageHero = () => {
  return (
    <section className="page-hero">
      {/* Web Awesome badge doubles as a tiny status chip */}
      <wa-badge className="hero-pill" variant="brand" pill>
        live preview
      </wa-badge>

      <h1>Frida</h1>
      <p>
        Upload a single 3x master image and let Frida mint precise 2x, 1.5x, and 1x siblings.
        Every rendition ships as PNG, JPEG, and WEBM so you can cover UI, marketing, and motion-ready
        pipelines without leaving the browser.
      </p>
    </section>
  )
}

export default PageHero
