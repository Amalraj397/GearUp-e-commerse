import morgan from "morgan";
import logger from "../utils/logger.js";


const skip = (req, res) => {
  return res.statusCode < 400;
};

const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

export const requestLogger = morgan(
  ":method :url :status :response-time ms",
  {skip, stream }
);

