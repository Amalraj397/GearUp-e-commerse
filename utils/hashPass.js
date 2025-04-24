import bcrypt from "bcrypt";

const securePassword = async (password) => {
  try {
    const passwordHashed = await bcrypt.hash(password, 10);
    return passwordHashed;
  } catch (error) {
    throw error;
  }
};

export default securePassword;
