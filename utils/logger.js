// import winston from "winston";
// import path from "path";

// const logFormat = winston.format.combine(
//   winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
//   winston.format.errors({ stack: true }),

//   winston.format.printf(
//     ({ level, message, timestamp, stack }) =>
//       `${timestamp} [${level.toUpperCase()}] : ${stack || message}`
//   )
// );

//  const logger = winston.createLogger({
//   level: "warn",
//   format: logFormat,
//   transports: [
//     // Error logs
//     new winston.transports.File({
//       filename: path.join("logs", "error.log"),
//       level: "error",
//     }),

//     // All logs
//     new winston.transports.File({
//       filename: path.join("logs", "combined.log"),
//       level: "warn",
//     }),
//   ],
// });

// // Console logs only for development
// if (process.env.NODE_ENV !== "production") {
//   logger.add(
//     new winston.transports.Console({
//       format: winston.format.simple(),
//     })
//   );
// }

// export default logger;


import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    ({ level, message, timestamp, stack }) =>
      `${timestamp} [${level.toUpperCase()}] : ${stack || message}`
  )
);

const logger = winston.createLogger({
  // 👇 default minimum log level
  level: "warn",

  format: logFormat,

  transports: [
    // 🔴 ONLY errors (no warnings here)
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),

    // 🟠 Warnings only (business issues)
    new winston.transports.File({
      filename: "logs/warn.log",
      level: "warn",
    }),

    // 🔁 Rotated logs (warn + error)
    new DailyRotateFile({
      filename: "logs/app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "10m",
      maxFiles: "14d",
      level: "warn",
    }),
  ],
});

// 🖥 Console logs only in development  
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;


