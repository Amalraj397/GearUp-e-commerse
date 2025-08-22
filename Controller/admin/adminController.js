export const loadAdminlogin = async (req, res) => {
  if (req.session.admin) return res.redirect("/admin/dashboard");
  try {
    res.render("LoginLanding.ejs");
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error  ");
  }
};

export const loadAdminDash = async (req, res) => {
  try {
    res.render("adminDash.ejs");
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error  ");
  }
};

// -------------------------------adminlogin-------------------------------

export const adminLogout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error during logout", err);
        res.status(500).send("internal server Error  ");
      }
      // clear cookie

      // res.clearCookie(user.id);     // clearing the userid
      res.clearCookie("connect.sid"); // clearing the session id
      return res.redirect("/");
      // res.status(200).json({ message: "Logout successfull..!" });
    });
  } catch (error) {
    console.error("Error login failed", error);
    res.status(500).send("internal server Error  ");
  }
};
