import { createHash } from "node:crypto";

const DEVELOPMENT_IP_HASH_SALT = "ferreras-smp-development-ip-hash-salt";

export const hashIp = (ip: string) => {
  const salt = process.env.IP_HASH_SALT || DEVELOPMENT_IP_HASH_SALT;

  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
};
