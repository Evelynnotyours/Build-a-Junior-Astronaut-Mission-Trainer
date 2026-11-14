import type { ReactNode } from 'react';

type OverlayProps = {
  kind?: 'frost' | 'none';
  tintClassName?: string;
  reduceMotion?: boolean;
  children?: ReactNode;
};

/** Decorative mood/effect layer. Always pointer-events: none. */
export function Overlay({
  kind = 'none',
  tintClassName,
  reduceMotion = false,
  children,
}: OverlayProps) {
  return (
    <div
      className={['ui-overlay', tintClassName, reduceMotion ? 'ui-overlay--calm' : '']
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      {kind === 'frost' ? (
        <img
          className="ui-overlay__frost"
          src="/assets/overlays/frost_corners.png"
          alt=""
          draggable={false}
        />
      ) : null}
      {children}
    </div>
  );
}
