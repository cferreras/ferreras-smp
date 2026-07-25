type CopyAttempt = (value: string) => boolean | void | Promise<boolean | void>;

export const copyText = async (value: string, attempts: CopyAttempt[]) => {
  for (const attempt of attempts) {
    try {
      if ((await attempt(value)) !== false) return true;
    } catch {
      // Try the next available browser copy method.
    }
  }

  return false;
};
