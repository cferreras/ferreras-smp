import { createHmac } from "node:crypto";

const DEVELOPMENT_IP_HASH_SALT = "ferreras-smp-development-ip-hash-salt";

export const hashIp = (ip: string) => {
  const salt = process.env.IP_HASH_SALT;

  if (!salt && process.env.NODE_ENV === "production") {
    throw new Error("IP_HASH_SALT is required in production");
  }

  return createHmac("sha256", salt || DEVELOPMENT_IP_HASH_SALT).update(ip).digest("hex");
};
