type RealMarsCardProps = {
  title: string;
  fact: string;
  sourceLabel: string;
  photoSrc?: string;
  photoAlt?: string;
  photoCredit?: string;
  savedPhoto?: boolean;
  mediaLabel?: string;
  sourceUrl?: string;
  photoSourceUrl?: string;
  photoCaption?: string;
  contextNote?: string;
  observationNote?: string;
  observationSourceUrl?: string;
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
  mediaLabel = 'Saved photo',
  sourceUrl,
  photoSourceUrl,
  photoCaption,
  contextNote,
  observationNote,
  observationSourceUrl,
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
        {savedPhoto ? (
          <span className="ui-real-mars__tag">{mediaLabel}</span>
        ) : null}
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
      {observationNote && <p>{observationNote}</p>}
      <details>
        <summary>Photo and sources</summary>
        {photoCaption && <p>{photoCaption}</p>}
        {contextNote && <p>{contextNote}</p>}
        <p className="ui-real-mars__source">{sourceLabel}</p>
        {observationSourceUrl && (
          <p>
            <a href={observationSourceUrl} target="_blank" rel="noreferrer">
              Mission solar observation source
            </a>
          </p>
        )}
        {sourceUrl && (
          <p>
            <a href={sourceUrl} target="_blank" rel="noreferrer">
              Fact source
            </a>
          </p>
        )}
        {photoSourceUrl && (
          <p>
            <a href={photoSourceUrl} target="_blank" rel="noreferrer">
              Image source
            </a>
          </p>
        )}
      </details>
      <button type="button" className="ui-btn" onClick={onClose}>
        Close
      </button>
    </article>
  );
}
