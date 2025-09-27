export const setUserLocals = (req, res, next) => {
  res.locals.user = req.session.user || null;
  // console.log("user", res.locals.user);
  next();
};
