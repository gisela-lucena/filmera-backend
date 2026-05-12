import winston from "winston";
import path from "path";

export const requestLogger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: path.join("logs", "request.log"),
    }),
  ],
});

export const errorLogger = winston.createLogger({
  level: "error",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
    }),
  ],
});
