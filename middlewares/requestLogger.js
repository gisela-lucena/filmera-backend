import { requestLogger } from "../utils/logger.js";

export const logRequests = (req, res, next) => {
  const logData = {
    Timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    body: req.body,
  };
  requestLogger.info(logData);
  next();
};
