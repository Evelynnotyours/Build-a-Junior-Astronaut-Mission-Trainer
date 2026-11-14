type PhotoFrameProps = {
  src: string;
  alt: string;
  credit?: string;
  savedLabel?: boolean;
  mediaLabel?: string;
};

export function PhotoFrame({
  src,
  alt,
  credit,
  savedLabel = true,
  mediaLabel = 'Saved photo',
}: PhotoFrameProps) {
  return (
    <figure className="ui-photo-frame">
      <div className="ui-photo-frame__mat">
        <img src={src} alt={alt} draggable={false} />
        {savedLabel ? (
          <span className="ui-photo-frame__tag">{mediaLabel}</span>
        ) : null}
      </div>
      {credit ? (
        <figcaption className="ui-photo-frame__credit">{credit}</figcaption>
      ) : null}
    </figure>
  );
}
