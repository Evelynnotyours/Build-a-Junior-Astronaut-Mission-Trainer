type CargoCardProps = {
  id: string;
  name: string;
  description: string;
  iconSrc: string;
  mass: number;
  selected?: boolean;
  disabled?: boolean;
  onToggle?: (id: string) => void;
};

/** Plan-phase cargo item. Selection only — loadout rules stay in the engine. */
export function CargoCard({
  id,
  name,
  description,
  iconSrc,
  mass,
  selected = false,
  disabled = false,
  onToggle,
}: CargoCardProps) {
  return (
    <button
      type="button"
      className={selected ? 'ui-cargo-card ui-cargo-card--selected' : 'ui-cargo-card'}
      disabled={disabled}
      aria-pressed={selected}
      onClick={() => onToggle?.(id)}
    >
      <img className="ui-cargo-card__icon" src={iconSrc} alt="" draggable={false} />
      <span className="ui-cargo-card__name">{name}</span>
      <span className="ui-cargo-card__desc">{description}</span>
      <span className="ui-cargo-card__mass">Weight {mass}</span>
    </button>
  );
}
