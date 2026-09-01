'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ASSET_BASE_URL } from '@/lib/config';

const PHOTOS = [
  { file: 'estate-01.jpg', className: 'w-[62%] aspect-[3/4] left-0 top-0', speed: 60 },
  { file: 'estate-04.jpg', className: 'w-[46%] aspect-[4/5] right-0 top-16', speed: -90 },
  { file: 'estate-08.jpg', className: 'w-[50%] aspect-[5/4] left-10 bottom-0', speed: 40 },
];

export function ParallaxCollage() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  return (
    <div ref={ref} className="relative hidden h-[480px] w-full lg:block">
      {PHOTOS.map((photo) => (
        <ParallaxPhoto key={photo.file} photo={photo} progress={scrollYProgress} />
      ))}
    </div>
  );
}

function ParallaxPhoto({
  photo,
  progress,
}: {
  photo: (typeof PHOTOS)[number];
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const y = useTransform(progress, [0, 1], [photo.speed, -photo.speed]);

  return (
    <motion.div
      style={{ y }}
      className={`absolute overflow-hidden rounded-3xl border border-border shadow-[0_30px_60px_-20px_rgba(31,111,235,0.4)] ${photo.className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${ASSET_BASE_URL}/storage/property-images/${photo.file}`} alt="" className="h-full w-full object-cover" />
    </motion.div>
  );
}
