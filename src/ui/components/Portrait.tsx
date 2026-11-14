import type { CrewExpression, RoboExpression, SpeakerPortrait } from '../../engine/scene-types';

type PortraitProps = SpeakerPortrait & {
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
};

const ROBO: Record<RoboExpression, string> = {
  neutral: '/assets/characters/robo_neutral.png',
  explaining: '/assets/characters/robo_explaining.png',
  concerned: '/assets/characters/robo_concerned.png',
  cheering: '/assets/characters/robo_cheering.png',
  thinking: '/assets/characters/robo_thinking.png',
};

const CREW: Record<'kai' | 'mei' | 'thiri', Record<CrewExpression, string>> = {
  kai: {
    neutral: '/assets/characters/kai_neutral.png',
    concerned: '/assets/characters/kai_concerned.png',
    happy: '/assets/characters/kai_happy.png',
  },
  mei: {
    neutral: '/assets/characters/mei_neutral.png',
    concerned: '/assets/characters/mei_concerned.png',
    happy: '/assets/characters/mei_happy.png',
  },
  thiri: {
    neutral: '/assets/characters/thiri_neutral.png',
    concerned: '/assets/characters/thiri_concerned.png',
    happy: '/assets/characters/thiri_happy.png',
  },
};

export function portraitSrc(portrait: SpeakerPortrait): string {
  if (portrait.speaker === 'robo') {
    return ROBO[portrait.expression];
  }
  return CREW[portrait.speaker][portrait.expression];
}

/** Accepts Gate A SpeakerPortrait so Robo/crew expression sets cannot be mixed. */
export function Portrait({ alt, size = 'md', ...portrait }: PortraitProps) {
  const label = alt ?? `${portrait.speaker} ${portrait.expression}`;
  return (
    <img
      className={`ui-portrait ui-portrait--${size}${portrait.speaker === 'robo' ? ' ui-portrait--robo' : ''}`}
      src={portraitSrc(portrait)}
      alt={label}
      draggable={false}
    />
  );
}
