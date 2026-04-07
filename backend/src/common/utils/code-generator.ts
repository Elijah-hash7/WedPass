const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const NUMBERS = '0123456789';

function randomCharacters(source: string, length: number) {
  return Array.from({ length }, () => {
    const index = Math.floor(Math.random() * source.length);
    return source[index];
  }).join('');
}

export function generateAccessCode() {
  return `${randomCharacters(LETTERS, 3)}-${randomCharacters(NUMBERS, 4)}`;
}

export function generateToken(size = 24) {
  const characters = `${LETTERS}${NUMBERS.toLowerCase()}`;
  return randomCharacters(characters, size);
}
