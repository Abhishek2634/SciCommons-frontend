import {
  emailOrUsernameSchema,
  matchPassword,
  nameSchema,
  optionalUrlSchema,
  passwordSchema,
} from '@/constants/zod-schema';

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

describe('matchPassword', () => {
  it('matches confirm-password values without regex parsing side effects', () => {
    const passwordWithRegexChars = 'A[bc](12)+?$';
    const schema = matchPassword(passwordWithRegexChars);

    expect(schema.safeParse(passwordWithRegexChars).success).toBe(true);
    expect(schema.safeParse('mismatch').success).toBe(false);
  });
});

describe('emailOrUsernameSchema', () => {
  it('accepts usernames containing dots', () => {
    expect(emailOrUsernameSchema.safeParse('john.doe').success).toBe(true);
  });
});

describe('passwordSchema', () => {
  it('requires complexity rules used by the signup UI', () => {
    expect(passwordSchema.safeParse('Onlyletters1').success).toBe(false);
    expect(passwordSchema.safeParse('ValidPass1!').success).toBe(true);
  });
});

describe('optionalUrlSchema', () => {
  it('allows empty profile links but validates non-empty URLs', () => {
    expect(optionalUrlSchema.safeParse('').success).toBe(true);
    expect(optionalUrlSchema.safeParse('not-a-url').success).toBe(false);
  });
});
