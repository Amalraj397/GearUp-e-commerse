export const generateReferralCode = (firstName, userId) => {
  const prefix = firstName.slice(0, 3).toUpperCase();  
  const uniquePart = userId.toString().slice(-5).toUpperCase();
  return `${prefix}${uniquePart}`;
};
