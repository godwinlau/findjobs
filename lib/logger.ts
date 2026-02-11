import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  ...(isProduction
    ? {} // JSON output in production (Vercel / structured log aggregators)
    : { transport: { target: "pino/file", options: { destination: 1 } } }),
});
