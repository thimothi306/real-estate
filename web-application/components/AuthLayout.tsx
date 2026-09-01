import { ASSET_BASE_URL } from '@/lib/config';

export function AuthLayout({
  title,
  subtitle,
  image = 'estate-05.jpg',
  children,
}: {
  title: string;
  subtitle: string;
  image?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-64px)] grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${ASSET_BASE_URL}/storage/property-images/${image}`}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Kavuri Estates</p>
          <p className="mt-3 max-w-md text-2xl font-semibold leading-snug text-white">
            Every home, plot, and investment — verified, in one place.
          </p>
        </div>
      </div>
    </div>
  );
}
