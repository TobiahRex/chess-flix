export default function parseCentipawn(centipawnVal) {
  if (!centipawnVal) return 0;
  return (centipawnVal / 100).toFixed(2);
}