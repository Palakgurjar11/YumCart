/** Minimal loading halo used across dashboards + async views */
export default function Spinner({ className = 'h-6 w-6' }) {
  return (
    <div
      className={`rounded-full border-2 border-orange-400/60 border-t-transparent animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
