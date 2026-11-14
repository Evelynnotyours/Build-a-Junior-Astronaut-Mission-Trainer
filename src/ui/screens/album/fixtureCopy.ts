import type { EventId } from '../../../engine/types';

export type AlbumCardRecord = {
  id: string;
  eventId: EventId;
  title: string;
  fact: string;
  sourceLabel: string;
  sourceUrl?: string;
  photoSrc?: string;
  photoAlt: string;
  photoCredit: string;
};

/**
 * Preview album cards. Member 2/3 replace with realMoments.json + bundled NASA photos.
 * Placeholders use shipped vista art and stay labeled Saved photo.
 */
export const FIXTURE_ALBUM: AlbumCardRecord[] = [
  {
    id: 'rm_touchdown_gale',
    eventId: 'touchdown',
    title: 'Gale Crater',
    fact: 'Gale Crater is a giant bowl on Mars about 154 km (96 miles) wide!',
    sourceLabel: 'NASA Mars Exploration · Gale Crater',
    sourceUrl: 'https://mars.nasa.gov/msl/mission/science/gale-crater/',
    photoSrc: '/assets/bg/mars_vista.jpg',
    photoAlt: 'Mars landscape placeholder for Gale Crater card',
    photoCredit: 'Placeholder art · final NASA photo TBD (Member 2/3)',
  },
  {
    id: 'rm_first_night',
    eventId: 'first_night',
    title: 'Mars moons',
    fact: 'Mars has two tiny moons named Phobos and Deimos.',
    sourceLabel: 'NASA Science · Mars moons',
    sourceUrl: 'https://science.nasa.gov/mars/moons/',
    photoSrc: '/assets/bg/sky_dawn.png',
    photoAlt: 'Sky placeholder for Mars night card',
    photoCredit: 'Placeholder art · final NASA photo TBD (Member 2/3)',
  },
  {
    id: 'rm_dust_2018',
    eventId: 'dust_storm',
    title: 'Planet-wide dust',
    fact: 'In 2018, a giant dust storm covered the entire planet of Mars!',
    sourceLabel: 'NASA Mars Exploration · Opportunity',
    sourceUrl: 'https://mars.nasa.gov/news/8348/opportunity-hunkers-down-during-dust-storm/',
    photoSrc: '/assets/bg/mars_vista.jpg',
    photoAlt: 'Dusty Mars landscape placeholder',
    photoCredit: 'Placeholder art · final NASA photo TBD (Member 2/3)',
  },
  {
    id: 'rm_ice_hunt',
    eventId: 'ice_hunt',
    title: 'Water in the dirt',
    fact: 'Martian dirt has a little bit of water trapped inside it.',
    sourceLabel: 'NASA · Curiosity soil water',
    sourceUrl: 'https://www.nasa.gov/news-release/nasas-curiosity-rover-finds-water-in-martian-soil/',
    photoSrc: '/assets/bg/mars_vista.jpg',
    photoAlt: 'Mars ground placeholder for ice hunt card',
    photoCredit: 'Placeholder art · final NASA photo TBD (Member 2/3)',
  },
];
