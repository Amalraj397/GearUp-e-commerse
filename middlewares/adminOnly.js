export const adminOnly = (req, res, next) => {
    console.log("middleware working");
    
    if (req.user?.isAdmin) {
      next();
    } else {
      res.status(403).send("Access Denied");
    }
  };
  
