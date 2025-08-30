import addressSchema from "../../Models/userAddressModel.js";

export const getAdd_UseraddressPage = (req, res) => {
  try {
    res.render("userAddressPage.ejs");
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error  ");
  }
};

export const add_UserAddress = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    altPhone,
    houseName,
    city,
    state,
    country,
    pincode,
    landmark,
    addressType,
  } = req.body;

  try {
    const userId = req.session.user?.id;
    console.log("userid in address adding:", userId);

    if (!userId) {
      return res
        .status(400)
        .json({ message: "Unauthoirzed access..! please login..!" });
    }
    const newAddress = new addressSchema({
      userId: userId,
      firstName,
      lastName,
      email,
      phone,
      altPhone,
      houseName,
      city,
      state,
      country,
      pincode,
      landmark,
      addressType,
    });
    await newAddress.save();
    res.status(201).json({ message: "User address saved successfully..!" });
  } catch (error) {
    console.log("error in saving user address", error);
    res.status(500).send("internal server Error..!");
  }
};

//===================== EDIT USER ADDRESS ===================

export const getEdit_userAddressPage = async (req, res) => {
  try {
    const address = await addressSchema.findById(req.params.id);
    res.status(200).render("editUserAddressPage.ejs", {
      address,
    });
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error  ");
  }
};



export const edit_userAddress = async (req, res) => {
  const user = req.session.user;
  const userId = user?.id;

  // console.log("userid in edit useraddress", userId); //debugging
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorised Access..!please login" });
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    altPhone,
    houseName,
    city,
    state,
    country,
    pincode,
    landmark,
    addressType,
  } = req.body;

  //  const userId = req.params.id;
  try {
    const address = await addressSchema.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (firstName) address.firstName = firstName;
    if (lastName) address.lastName = lastName;
    if (email) address.email = email;
    if (phone) address.phone = phone;
    if (altPhone) address.altPhone = altPhone;
    if (houseName) address.houseName = houseName;
    if (city) address.city = city;
    if (state) address.state = state;
    if (country) address.country = country;
    if (pincode) address.pincode = pincode;
    if (landmark) address.landmark = landmark;
    if (addressType) address.addressType = addressType;
    await address.save();

    res.status(200).json({ message: "Address updated successfully" });
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error  ");
  }
};


export const makedefault = async (req, res) => {
  const user = req.session.user;
  const userID =user?.id;
  try {
    if (!user) {
      return res.redirect("/login");
    }
    const addressId = req.params.id;

    await addressSchema.updateMany(
      { userId: userID}, 
      { $set: { isDefault: false } }
    );

    // console.log("---------------------------")
    //  console.log("userID-----:", userID);
    //  console.log("---------------------------")


    const address = await addressSchema.findOneAndUpdate(
      { _id: addressId, userId: userID },
      { $set: { isDefault: true } },
      { new: true }
    );

    //  console.log("---------------------------")
    //  console.log("address-----:", address);
    //  console.log("---------------------------")

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json({ message: "Default address updated successfully" });
  } catch (error) {
    console.log("error in setting default address", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const delete_userAddress = async (req, res) => {
  try {
    await addressSchema.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.log("error in loading the page", error);
    return res.status(500).send("Server Error");
  }
};
