export interface RiskSignals {
  body: string;
  duplicate: boolean;
  ratePressure: number;
  blockedTerms: string[];
}

export interface RiskAssessment {
  score: number;
  decision: "publish" | "quarantine" | "reject";
  reasons: string[];
}

const URL_PATTERN = /\b(?:https?:\/\/|www\.)\S+/gi;
const REPEATED_CHARACTER_PATTERN = /(.)\1{9,}/u;

export const assessCommentRisk = ({
  body,
  duplicate,
  ratePressure,
  blockedTerms,
}: RiskSignals): RiskAssessment => {
  let score = 0;
  const reasons: string[] = [];
  const links = body.match(URL_PATTERN)?.length ?? 0;
  const normalizedBody = body.toLocaleLowerCase("es");

  if (links === 1) {
    score += 2;
    reasons.push("contains_link");
  } else if (links > 1) {
    score += 6;
    reasons.push("multiple_links");
  }

  if (duplicate) {
    score += 7;
    reasons.push("duplicate");
  }

  if (ratePressure >= 0.8) {
    score += 4;
    reasons.push("rate_pressure");
  } else if (ratePressure >= 0.5) {
    score += 2;
    reasons.push("rate_pressure");
  }

  if (REPEATED_CHARACTER_PATTERN.test(body)) {
    score += 2;
    reasons.push("repeated_characters");
  }

  if (blockedTerms.some((term) => term && normalizedBody.includes(term.toLocaleLowerCase("es")))) {
    score += 6;
    reasons.push("blocked_term");
  }

  return {
    score,
    decision: score >= 10 ? "reject" : score >= 5 ? "quarantine" : "publish",
    reasons,
  };
};
