export type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className={className}>
      <rect width="32" height="32" rx="7" className="fill-primary" />
      <path d="M11 9h11v3.5h-7v3h6v3.5h-6V23h-4z" className="fill-primary-foreground" />
    </svg>
  );
}
