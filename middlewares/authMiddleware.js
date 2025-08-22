const authMiddleware = async (req, res, next) => {
  const userId = req.session.userId;

  if (userId) {
    const user = await userschema.findById(userId);
    if (user) {
      req.user = user;
    }
  }

  next();
};
