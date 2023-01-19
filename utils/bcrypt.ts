import bcrypt from 'bcrypt';

const generatePassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const comparePassword = async (
  stringCompared: string,
  password: string
): Promise<boolean> => {
  return await bcrypt.compare(stringCompared, password);
};

export { generatePassword, comparePassword };
