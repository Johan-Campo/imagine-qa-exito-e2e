export function parsePesos(text: string): number {
  return Number(text.replace(/\D/g, ''));
}
