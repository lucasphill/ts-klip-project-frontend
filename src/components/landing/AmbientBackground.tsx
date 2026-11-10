/** Fundo decorativo com blobs desfocados nas cores da marca. Exclusivo da landing. */
export default function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="landing-blob landing-blob--a" />
      <div className="landing-blob landing-blob--b" />
      <div className="landing-blob landing-blob--c" />
      <div className="landing-grid absolute inset-0" />
    </div>
  );
}
