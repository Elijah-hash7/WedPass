import { generateAccessCode, generateToken } from './code-generator';

describe('code generator helpers', () => {
  it('creates an access code in the expected format', () => {
    const accessCode = generateAccessCode();

    expect(accessCode).toMatch(/^[A-Z]{3}-\d{4}$/);
  });

  it('creates a token with the requested size', () => {
    const token = generateToken(24);

    expect(token).toHaveLength(24);
  });
});
