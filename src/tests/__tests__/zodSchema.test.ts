import { nameSchema } from '@/constants/zod-schema';

describe('nameSchema', () => {
  it('accepts international names and common separators', () => {
    const validNames = [
      'Jose',
      'Jose Alvarez',
      "O'Connor",
      'Anne-Marie',
      'Zoe',
      'Dvorak',
      '李',
      'محمد',
      'Jean Luc',
    ];

    validNames.forEach((name) => {
      expect(nameSchema.safeParse(name).success).toBe(true);
    });
  });

  it('rejects digits, symbol-only values, and whitespace-only values', () => {
    const invalidNames = ['John3', '!!!', '   ', '@name'];

    invalidNames.forEach((name) => {
      expect(nameSchema.safeParse(name).success).toBe(false);
    });
  });
});
