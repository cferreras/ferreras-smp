import {
  COMMENT_BODY_MAX_LENGTH,
  COMMENT_NICKNAME_MAX_LENGTH,
  COMMENT_NICKNAME_MIN_LENGTH,
} from "./constants.ts";

export class CommentValidationError extends Error {
  readonly field: "nickname" | "body" | "request";

  constructor(
    message: string,
    field: "nickname" | "body" | "request",
  ) {
    super(message);
    this.name = "CommentValidationError";
    this.field = field;
  }
}

const BIDI_AND_INVISIBLE = /[\u061c\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/u;
const DISALLOWED_CONTROLS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/u;
const NICKNAME_CHARACTERS = /^[\p{L}\p{N}_ -]+$/u;
const RESERVED_SKELETONS = new Set([
  "admin",
  "administrador",
  "moderador",
  "moderation",
  "staff",
  "ferreras",
  "ferrerassmp",
  "soporte",
]);

const characterLength = (value: string) => [...value].length;

const skeleton = (value: string) => value
  .normalize("NFKD")
  .replace(/\p{M}/gu, "")
  .toLocaleLowerCase("es")
  .replace(/[^a-z0-9]/g, "");

export const normalizeNickname = (input: unknown) => {
  if (typeof input !== "string") {
    throw new CommentValidationError("Escribe un nick válido.", "nickname");
  }

  const nickname = input.normalize("NFKC").trim().replace(/\s+/g, " ");
  const length = characterLength(nickname);

  if (length < COMMENT_NICKNAME_MIN_LENGTH || length > COMMENT_NICKNAME_MAX_LENGTH) {
    throw new CommentValidationError(
      `El nick debe tener entre ${COMMENT_NICKNAME_MIN_LENGTH} y ${COMMENT_NICKNAME_MAX_LENGTH} caracteres.`,
      "nickname",
    );
  }

  if (
    BIDI_AND_INVISIBLE.test(nickname)
    || DISALLOWED_CONTROLS.test(nickname)
    || !NICKNAME_CHARACTERS.test(nickname)
  ) {
    throw new CommentValidationError(
      "El nick solo puede contener letras, números, espacios, guiones y guion bajo.",
      "nickname",
    );
  }

  if (RESERVED_SKELETONS.has(skeleton(nickname))) {
    throw new CommentValidationError("Ese nick está reservado por el equipo.", "nickname");
  }

  return nickname;
};

export const normalizeCommentBody = (input: unknown) => {
  if (typeof input !== "string") {
    throw new CommentValidationError("Escribe un comentario válido.", "body");
  }

  const body = input
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, " ")
    .trim();
  const length = characterLength(body);

  if (length < 2 || length > COMMENT_BODY_MAX_LENGTH) {
    throw new CommentValidationError(
      `El comentario debe tener entre 2 y ${COMMENT_BODY_MAX_LENGTH} caracteres.`,
      "body",
    );
  }

  if (BIDI_AND_INVISIBLE.test(body) || DISALLOWED_CONTROLS.test(body)) {
    throw new CommentValidationError("El comentario contiene caracteres no permitidos.", "body");
  }

  return body;
};

export const validateSubmission = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new CommentValidationError("La solicitud no es válida.", "request");
  }

  const record = value as Record<string, unknown>;
  if (record.website) {
    throw new CommentValidationError("No se pudo procesar el comentario.", "request");
  }

  if (typeof record.turnstileToken !== "string" || !record.turnstileToken) {
    throw new CommentValidationError("Completa la comprobación anti-spam.", "request");
  }

  if (
    typeof record.idempotencyKey !== "string"
    || !/^[a-zA-Z0-9_-]{16,100}$/.test(record.idempotencyKey)
  ) {
    throw new CommentValidationError("Vuelve a cargar el formulario e inténtalo de nuevo.", "request");
  }

  return {
    nickname: normalizeNickname(record.nickname),
    body: normalizeCommentBody(record.body),
    turnstileToken: record.turnstileToken,
    idempotencyKey: record.idempotencyKey,
  };
};
