/**
 * Pool photography used as page and section backdrops.
 *
 * The photographs are sourced from Unsplash and stored in
 * `public/images/pools/`, then referenced by path — nothing is hot-linked, so
 * the site keeps working when the CDN is slow or unreachable, as it was in
 * testing. Files were downloaded at the width they are displayed at, with
 * quality tuned so no backdrop is over a few hundred kilobytes.
 *
 * Photographer credits are recorded beside each entry and repeated in the alt
 * text wherever a photograph is content rather than decoration.
 *
 * Backdrops always sit behind a flat colour scrim, never a gradient.
 */
export const POOL_PHOTOS = {
  /** Still water at dusk — homepage and about hero. Fernando Álvarez Rodríguez. */
  hero: {
    url: "/images/pools/pool-hero.jpg",
    alt: "Lit pool at dusk below a villa — Fernando Álvarez Rodríguez on Unsplash",
  },
  /** Pool above the sea at dusk — page banners. Ahmad Ajmi. */
  banner: {
    url: "/images/pools/pool-seaside.jpg",
    alt: "Pool above the sea at dusk — Ahmad Ajmi on Unsplash",
  },
  /** Turquoise water seen from above — closing enquiry bands. Drew Dau. */
  closing: {
    url: "/images/pools/pool-plunge.jpg",
    alt: "Turquoise water in a walled plunge pool — Drew Dau on Unsplash",
  },
  /** House and pool — residential evidence. Cesar Cid. */
  residential: {
    url: "/images/pools/pool-residential.jpg",
    alt: "House with a swimming pool — Cesar Cid on Unsplash",
  },
  /** Round pool lit at night — commercial evidence. Vita Vilcina. */
  commercial: {
    url: "/images/pools/pool-night-villa.jpg",
    alt: "Round pool lit at night in front of a villa — Vita Vilcina on Unsplash",
  },
  /** Infinity edge with a planted surround — maintenance evidence. Sanju Pandita. */
  resort: {
    url: "/images/pools/pool-infinity.jpg",
    alt: "Infinity-edge pool with a planted surround — Sanju Pandita on Unsplash",
  },
} as const;
