import addressSchema from "../../Models/userAddressModel.js";
import { MESSAGES } from "../../utils/messagesConfig.js"
import { STATUS } from "../../utils/statusCodes.js";

//===================== GET USER ADDRESS PAGE ===================
export const getAdd_UseraddressPage = (req, res,next) => {
  try {
    res.render("userAddressPage.ejs");
  } catch (error) {
    console.error(MESSAGES.Address.AddressLogger.ADD_LOAD_EROR, error);
    next(error);
  }
};

//===================== ADD USER ADDRESS ===================
export const add_UserAddress = async (req, res, next) => {
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
    
    if (!userId) {
      return res
        .status(STATUS.UNAUTHORIZED)
        .json({ message: MESSAGES.System.UNAUTHORIZED });
    }

    const newAddress = new addressSchema({
      userId,
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
    res.status(STATUS.CREATED).json({ message: MESSAGES.Address.ADDED });
  } catch (error) {
    console.error(MESSAGES.Address.AddressLogger.ADD_SAVE_EROR, error);
    next(error);
  }
};

//===================== EDIT USER ADDRESS PAGE ===================
export const getEdit_userAddressPage = async (req, res ,next) => {
  try {
    const address = await addressSchema.findById(req.params.id);
    res
    .status(STATUS.OK)
    .render("editUserAddressPage.ejs", { address });
    
  } catch (error) {
    console.error(MESSAGES.Address.AddressLogger.ADD_LOAD_EDIT_EROR, error); 
     next(error);
  }
};

//===================== EDIT USER ADDRESS ===================
export const edit_userAddress = async (req, res, next) => {
  const userId = req.session.user?.id;

  if (!userId) {
    return res
      .status(STATUS.UNAUTHORIZED)
      .json({ message: MESSAGES.System.UNAUTHORIZED });
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

  try {
    const address = await addressSchema.findById(req.params.id);

    if (!address) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ message: MESSAGES.Address.NOT_FOUND });
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

    res
    .status(STATUS.OK)
    .json({ message: MESSAGES.Address.UPDATED });

  } catch (error) {
    console.error(MESSAGES.Address.AddressLogger.ADD_UPD_EROR, error);
    next(error);
  }
};

//===================== MAKE DEFAULT ADDRESS ===================
export const makedefault = async (req, res, next) => {
  const userId = req.session.user?.id;

  try {
    if (!userId) {
      return res
        .status(STATUS.UNAUTHORIZED)
        .json({ message: MESSAGES.System.UNAUTHORIZED });
    }

    const addressId = req.params.id;

    await addressSchema.updateMany({ userId }, { $set: { isDefault: false } });

    const address = await addressSchema.findOneAndUpdate(
      { _id: addressId, userId },
      { $set: { isDefault: true } },
      { new: true },
    );

    if (!address) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ message: MESSAGES.Address.NOT_FOUND });
    }

    res.status(STATUS.OK).json({ message: MESSAGES.Address.DEFAULT_UPDATED });
  } catch (error) {
    console.error(MESSAGES.Address.AddressLogger.ADD_DEF_EROR, error);
    next(error);
  }
};

//===================== DELETE USER ADDRESS ===================
export const delete_userAddress = async (req, res, next) => {
  try {
    const address = await addressSchema.findByIdAndDelete(req.params.id);

    if (!address) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ message: MESSAGES.Address.NOT_FOUND });
    }

    return res.status(STATUS.OK).json({ message: MESSAGES.Address.DELETED });
  } catch (error) {
    console.error(MESSAGES.Address.AddressLogger.ADD_DEL_EROR, error);
     next(error);
  }
};
