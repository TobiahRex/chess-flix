export default function isFEN(input) {
  const parts = input.trim().split(' ');
  return parts.length === 6;
};