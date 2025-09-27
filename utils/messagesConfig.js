export const MESSAGES = {
  System: {

    LANDING_ERR: "Error occured in loading LANDING-PAGE",
    SIGNUP_ERR: "Error occured in loading SIGNUP-PAGE",
    SUCCESS: "Operation successful",
    CREATED: "Resource created successfully",
    UPDATED: "Resource updated successfully",
    DELETED: "Resource deleted successfully",

    FAILED: "Operation Failed",
    CREATION_FAILED: "Resource creation Failed",
    UPDATION_FAILED: "Resource updation Failed",
    DELETION_FAILED: "Resource deletion Failed",

    BAD_REQUEST: "Invalid request",
    UNAUTHORIZED: "Authentication required",
    FORBIDDEN: "Access denied",
    NOT_FOUND: "Resource not found",
    PAGE_NOT_FOUND: "Page not found",
    SERVER_ERROR: "Internal server error. Please try again later.",

    ORDER_UPDATE_ERROR: "Error updating order status",
    ORDER_DETAIL_ERROR: "Error in loading order detail page",
    ORDER_ADMINPAGE_ERROR: "Error in loading admin order page",

    STATUS_INV: "Invalid Status",
    PAGE_ERROR: "Error in loading the page",
    ALL_REQUIRED: "All required fields must be filled.",
    WELCOME: "Welcome Admin!",
    LOGIN_SUCESS: "Login successful!",

    THANKS_NOTE: "Thank you for shopping. Keep shopping with AutoMinima.",
    INVOICE_EROR: "Error In generating invoice",
    SERCH_FAIL: "Failed to search.."
  },

  Products: {
    PRODUCT_NOT_FOUND: "Product cannot be found",
    PRODUCT_CRE_FAILED: "Product creation failed",
    PRODUCT_UPD_FAILED: "Product updation failed",
    PRODUCT_DEL_FAILED: "Product deletion failed",

    PRODUCT_CREATED: "Product created successfully",
    PRODUCT_UPDATED: "Product updated successfully",
    PRODUCT_DELETED: "Product deleted successfully",
    PRODUCT_LISTED: "Product listed successfully",
    PRODUCT_LIST_FAILED: "Failed to List the product",
    PRODUCT_UNLISTED: "Product un-listed successfully",
    PRODUCT_UNLIST_FAILED: "Failed to un-list the Product",
    ADD_PRODUCT_PAGE_FAILED: "Failed to  load the add-PRoduct Page",
    PRODUCT_LISTING_FAIL: "Failed to Show Product listing page",
    
    PRODUCT_EXSIST: "This product already exists",
    PRODUCT_UPLOAD_PAGE_FAIL: "Failed to load Product Update Page",

    IMAGE_REQUIRED: "At least 3 images are required",
    INVALID_CATEGORY: "Invalid category name",
    INVALID_BRAND: "Invalid brand name",
    NO_IMAGE_ID: "No image-ID provided",
    
  },

  Orders: {
    ORDER_SUCCESS: "Your order has been placed successfully",
    ORDER_FAILURE: "Your order has failed",
    ORDER_EROR: "An Error occured in placing the Order",
    ORDER_RETURN_PROCESSING: "Your order return has been processed",
    ORDER_RETURN: "Your order has been returned successfully",
    ORDER_RETURN_FAIL:"Failed to return the current order",
    ORDER_CANCEL: "Your order has been cancelled..!",
    ORDER_CANCEL_FAIL: "Failed to cancel the order..!",
    CHECKOUT_PAGE_EROR:" Error in loading the CHECKOUT page",
    ORDER_SUCCESS_EROR :"Error loading order success page:",

    NO_ORDER: "Could not find any Orders",
    INVALID_STATUS: "Invalid order status.",
    UPDATED: "Order updated successfully.",
    UPDATE_FAILED: "Failed to update order status",
    ITEM_RETRN_ERR: "An error occured while cancelling the OrderItem",
    ORDR_ID_REQED:"Order ID is required",
    ORDR_ITM_ID_REQED:"ORDER-ITEM_ID is required",

    CANCEL_SUCCESS:"Product cancelled successfully" ,
    CANCEL_FAIL: "This product is already cancelled",
    CANNOT_CANCEL:"This cannot be cancelled after shipping/delivery",
 
  },

  OrderReturn: {
    PAGE_ERROR: "Error in loading order return page",
    NOT_FOUND: "Order Return request not found",
    APPROVED: "Order Return request approved",
    APPROVE_FAILED: "Error approving Order return",
    REJECTED: "Order Return request rejected",
    REJECT_FAILED: "Error rejecting Order return",
    REASON_REQUIRED: "Reason is required",
    DELIVERED_ONLY: "Only delivered orders can be returned.",
  },

  Cart: {
    NO_CART: "Cart not found! Try again..",
  },

  Users: {
    NO_USER: "User not found..! Please login",
    USER_FETCH_FAILED: "Failed to fetch user data",
    USER_BLOCKED: "User has been blocked successfully",
    USER_UNBLOCKED: "User has been unblocked successfully",
    USER_BLOCK_FAILED: "Failed to block user",
    USER_UNBLOCK_FAILED: "Failed to unblock user",
    USER_ACCESS_BLK: "Sorry, you're blocked from accessing.",
    UNAUTHORIZED: "Unauthorized access..please Login!",
    USER_BLKED_BY_ADMIN: "Your account has been blocked by the admin",
    OLD_PASSWORD_MISMATCH: "Old password does not match!",
    PASSWORD_MISMATCH: "newPassword & ConfirmNewPassword do not match..!",
    PROFILE_UPDATED: "User profile updated successfully..!",
    SIGNUP_ERR: "Error Occured while User SignUp..!",
    MY_ODR_ERR:"Error in loading userOrders page..!",

    UserProfileLogger: {
      DASHBOARD_LOAD_ERROR: "Error in loading user dashboard page:",
      EDITPAGE_LOAD_ERROR: "Error in loading edit user profile page:",
      UPDATE_ERROR: "Error in updating user profile:",
    }
  },
  
  Store: {
    ERROR_LOADING_PRODUCTS: "Error loading product page",
    ERROR_LOADING_PRODUCT_DETAIL: "Error loading product detail page",
    ERROR_LOADING_CATEGORY: "Error loading category page",
    ERROR_LOADING_BRAND: "Error loading brand page",
    ERROR_FILTERING_PRODUCTS: "Error filtering products",
    SERVER_ERROR: "Server error",
  },

  Error: {
    SERVER_ERROR: "Internal server error. Please try again later.",
    ABOUT_PGE_EROR: "error in loading About page..!",
  },

  Brand: {
    IMAGE_REQUIRED: "Please upload a logo image.",
    ALREADY_EXISTS: "Brand already exists. Try again!",
    ADDED_SUCCESS: "New brand added successfully!",
    UNLIST_SUCCESS: "Brand unlisted successfully.",
    UNLIST_FAILED: "Failed to unlist brand.",
    LIST_SUCCESS: "Brand listed successfully.",
    LIST_FAILED: "Failed to list brand.",
    NOT_FOUND: "Brand not found.",
    UPDATE_SUCCESS: "Brand updated successfully.",
    UPDATE_FAILED: "Server error while updating brand.",

    BRAND_EDIT_PAGE_ERR: "Failed to load Brand EDIT Page",
    BRAND_ADD_PAGE_ERR: "Failed to load Brand ADD Page",
    BRAND_LISTING_ERR: "Failed to load Brand LISTING Page",
  },

  Category: {
    ALREADY_EXISTS: "Category already exists. Try again!",
    ADDED_SUCCESS: "Category added successfully.",
    ADD_FAILED: "Server error. Could not add category.",
    UNLIST_SUCCESS: "Category unlisted successfully.",
    UNLIST_FAILED: "Failed to unlist category.",

    LIST_SUCCESS: "Category listed successfully.",
    LIST_FAILED: "Failed to list category.",
    NOT_FOUND: "Category not found.",
    UPDATE_SUCCESS: "Category updated successfully.",
    UPDATE_FAILED: "Server error while updating category.",
    CAT_EDIT_PAGE_ERR: "Failed to load Catergory EDIT Page",
    CAT_ADD_PAGE_ERR: "Failed to load Catergory ADD Page",
    CAT_LISTING_ERR: "Failed to load Catergory LISTING Page",
  },

  Address: {
    ADDED: "User address saved successfully.",
    ADD_FAILED: "Failed to save user address.",
    UPDATED: "Address updated successfully.",
    UPDATE_FAILED: "Failed to update address.",
    DELETED: "Address deleted successfully.",
    DELETE_FAILED: "Failed to delete address.",
    NOT_FOUND: "Address not found.",
    DEFAULT_UPDATED: "Default address updated successfully.",
    DEFAULT_FAILED: "Failed to set default address.",

    AddressLogger: {
      ADD_LOAD_EROR: "Error in loading the page:",
      ADD_SAVE_EROR: "Error in saving user address:",
      ADD_LOAD_EDIT_EROR: "Error in loading the edit page:",
      ADD_UPD_EROR: "Error in updating user address:",
      ADD_DEF_EROR: "Error in setting default address:",
      ADD_DEL_EROR: "Error in deleting user address:",
      ADD_GET_EROR :"Error in getting address:",
    },
  },

  Cart: {
    NO_CART: "Cart not found",
    CART_EMPTY: "Your cart is empty.!",
    ITEM_ADDED: "Product added to cart successfully.",
    ITEM_ADDED_FROM_WISHLIST:
      "Product added to cart and removed from wishlist.",
    ITEM_ALREADY_IN_CART:
      "This variant is already in your cart. Do you want to increase quantity?",
    ITEM_REMOVED: "Item removed from cart successfully",
    ITEM_NOT_FOUND: "Item not found in cart.",
    MAX_QUANTITY: "Maximum quantity limit reached.",
    EXCEEDS_STOCK: "Requested quantity exceeds available stock.",
    UPDATED: "Quantity updated successfully.",
    CART_FETCH_FAILED: "Failed to fetch cart items",

    CartLogger: {
      CART_PAGE_EROR: "error in loading cart page",
      CART_ADD_EROR: "error in adding to cart",
      CART_REM_EROR: "error in removing from cart",
      CART_QTY_EROR: "Error increasing cart quantity",
    },
  },

  Wishlist: {
    ITEM_ADDED: "Product added to wishlist successfully",
    ITEM_REMOVED: "Product removed from wishlist successfully",
    FETCH_FAILED: "Failed to fetch wishlist",
    EMPTY: "Your wishlist is empty",

    NOT_FOUND: "Wishlist not found",
    ITEM_ALREADY_EXISTS: "This product is already in your wishlist",
    ITEM_ADDED: "Product added to wishlist!",
    ITEM_REMOVED: "Product removed from wishlist",
    ADD_ERROR: "An error occurred while adding product to wishlist",
    REMOVE_ERROR: "Failed to remove product from wishlist",
    PAGE_ERROR: "Error in loading WishList",
    USER_OR_PRODUCT_NOT_FOUND: "User or Product not found..!",
},

  Error: {
    SERVER_ERROR: "Internal server error",
    BAD_REQUEST: "Bad request",
    FORBIDDEN: "You don't have permission to perform this action",
    UNAUTHORIZED: "You are not authorized",
  },

  Auth: {
    LOGIN_PAGE_ERROR: "Error in loading LOGIN page",
    LOGOUT_PAGE_ERROR: "Error in loading LOGOUT page",
    LOGOUT_FAILED: "Logout failed",

    EMAIL_NOT_REGISTERED: "User email not registered..! Please sign up",
    EMAIL_VERIFIED: "Email verification successful! Please enter the OTP.",
    EMAIL_VERIFY_FAIL : "Error in while verifying the E-mail",

    OTP_SENT: "A new OTP has been sent to your email.",
    OTP_EXPIRED: "OTP expired. Please request a new OTP.",
    OTP_INVALID: "Invalid OTP. Please try again..!",
    OTP_SUCCESS: "OTP verification successful..!",
    RESENT_OTP_EROR: "Error resending OTP:",
    OTP_VERIFY_EROR: "Error during OTP verification",
    OTP_PAGE_ERROR: "Error in loading the OTP page",
    GOOGLE_SIGNUP_SVR_ERR: "Server error during Google signup",
    GOOGLE_SIGNUP_EROR: "Google Signup Error:",
    RESEND_WAIT: "Please wait before requesting a new OTP.",
    PASSWORD_MATCH_EROR: "Password does not match!, try again.",
    ERR_RESET_PASS_PAGE:" Error in loading the  resent OTP Page",

    PASSWORD_UPDATE_SUCCESS:
      "Password updated successfully..! You can login now.",
    PASSWORD_UPDATE_FAILED: "Failed to update password. Please try again.",
  },
};
