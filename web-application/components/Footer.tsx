export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted">
        <p>© {new Date().getFullYear()} Kavuri Estates. All rights reserved.</p>
        <p className="mt-1">One app for every property need.</p>
      </div>
    </footer>
  );
}
