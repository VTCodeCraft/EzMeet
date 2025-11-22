import bcrypt from 'bcrypt';
/**
 * Hash a string using bcrypt
 * @param value - Plain text to hash
 * @param saltRounds - Bcrypt salt rounds (default 10)
 * @returns The hashed string
 */
export const hashValue = async (value: string, saltRounds: number = 10): Promise<string> => {
  return await bcrypt.hash(value, saltRounds);
};
/**
 * Compare plain text with hashed value
 * @param value - Plain text
 * @param hashedValue - Previously hashed string
 * @returns true if match, false otherwise
 */
export const compareValue = async (value: string, hashedValue: string): Promise<boolean> => {
  return await bcrypt.compare(value, hashedValue);
};
