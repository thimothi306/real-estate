import { ASSET_BASE_URL } from '@/lib/config';

const IMAGES = Array.from({ length: 10 }, (_, i) => `estate-${String(i + 1).padStart(2, '0')}.jpg`);

/**
 * A continuous, seamless horizontal scroll of property photos, done in pure
 * CSS so animation-play-state:paused works on hover (a JS-driven animation
 * loop can't be paused by CSS). Seamless loop trick: render the sequence
 * twice back-to-back and translate exactly -50% (one copy's width).
 */
export function ImageMarquee() {
  const track = [...IMAGES, ...IMAGES];

  return (
    <div className="relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <style>{`
        @keyframes kavuri-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
      <div
        className="flex w-max gap-5 hover:[animation-play-state:paused]"
        style={{ animation: 'kavuri-marquee 40s linear infinite' }}
      >
        {track.map((file, i) => (
          <div
            key={`${file}-${i}`}
            className="h-56 w-80 shrink-0 overflow-hidden rounded-2xl border border-border shadow-md transition duration-300 hover:scale-105 hover:shadow-xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${ASSET_BASE_URL}/storage/property-images/${file}`} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
