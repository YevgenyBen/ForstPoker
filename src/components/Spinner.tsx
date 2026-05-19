type Props = {
  className?: string;
};

export function Spinner({ className = "size-4" }: Props) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      role="status"
      aria-hidden
    />
  );
}
