// MOTION: route crossfade. template.tsx re-mounts on navigation, so the fade runs per route (reduced motion: none).
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="route-fade">{children}</div>;
}
