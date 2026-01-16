 export const calculateOfferStatus = (startDate, endDate) => {
  const now = new Date();
  return startDate <= now && endDate >= now;
};

