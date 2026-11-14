type RealMarsCardProps = {
  title: string;
  fact: string;
  sourceLabel: string;
  photoSrc?: string;
  photoAlt?: string;
  photoCredit?: string;
  savedPhoto?: boolean;
  collapsed?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
};

export function RealMarsCard({
  title,
  fact,
  sourceLabel,
  photoSrc,
  photoAlt = 'Real Mars photo',
  photoCredit,
  savedPhoto = true,
  collapsed = true,
  onOpen,
  onClose,
}: RealMarsCardProps) {
  if (collapsed) {
    return (
      <button type="button" className="ui-real-mars-badge" onClick={onOpen}>
        Real Mars, tap to read
      </button>
    );
  }

  return (
    <article className="ui-real-mars" aria-label={title}>
      <header className="ui-real-mars__header">
        <h2>{title}</h2>
        {savedPhoto ? <span className="ui-real-mars__tag">Saved photo</span> : null}
        <span className="ui-real-mars__tag">Real photo</span>
      </header>
      {photoSrc ? (
        <figure className="ui-real-mars__figure">
          <img src={photoSrc} alt={photoAlt} />
          {photoCredit ? <figcaption>{photoCredit}</figcaption> : null}
        </figure>
      ) : (
        <p className="ui-real-mars__missing">Photo not bundled yet.</p>
      )}
      <p className="ui-real-mars__fact">{fact}</p>
      <p className="ui-real-mars__source">{sourceLabel}</p>
      <button type="button" className="ui-btn" onClick={onClose}>
        Close
      </button>
    </article>
  );
}
