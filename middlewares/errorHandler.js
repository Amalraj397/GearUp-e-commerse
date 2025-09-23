// const errorHandler = (error, req, res, next)=>{
//     console.error (error.stack)  // error stack for debugging

//     // set response status code based on the error default 500

//     const statusCode = error.statusCode || 500;
//     res.status(statusCode)
//     .json({ message : error.message || 'Internal Server Error', status : statusCode});

// };


import { MESSAGES } from "../utils/messagesConfig.js";
import { STATUS } from "../utils/statusCodes.js"


// export const errorHandler =(err, req, res, next)=>{
//      console.error("Error:", err.message);

//       res.status(err.statusCode || STATUS.INTERNAL_SERVER_ERROR)
//       .render("500")
      
// };


// --------------------------------------------------------------------------------

// export const errorHandler =(err, req, res, next)=>{
//   console.log("err::", err)

//    if(err.statusCode==STATUS.INTERNAL_SERVER_ERROR){
//     res.status(err.statusCode || STATUS.INTERNAL_SERVER_ERROR)
//       .render("500")
//    }else{
//       res.status(err.statusCode)
//       .json({message: err.message})
    
//    }
//      console.error("Error:", err.message);
// };

export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);

  const statusCode = err.statusCode || STATUS.INTERNAL_SERVER_ERROR;

  const errorInfo = {
    statusCode,
    title: "",
    message: "",
  };

  switch (statusCode) {
    case STATUS.BAD_REQUEST:
      errorInfo.title = "Bad Request";
      errorInfo.message = "Your request could not be understood or was invalid.";
      break;

    case STATUS.UNAUTHORIZED:
      errorInfo.title = "Unauthorized";
      errorInfo.message = "You must log in to access this page.";
      break;

    case STATUS.FORBIDDEN:
      errorInfo.title = "Forbidden";
      errorInfo.message = "You don’t have permission to access this resource.";
      break;

    case STATUS.NOT_FOUND:
      return res.status(STATUS.NOT_FOUND).render("page-404");

    case STATUS.TOO_MANY_REQUESTS:
      errorInfo.title = "Too Many Requests";
      errorInfo.message = "You’ve sent too many requests. Please try again later.";
      break;

    case STATUS.INTERNAL_SERVER_ERROR:
    default:
      errorInfo.title = "Server Error";
      errorInfo.message = "Something went wrong on our end. Please try again later.";
      break;
  }

  res.status(statusCode).render("errors", errorInfo);
};
