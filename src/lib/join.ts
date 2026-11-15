import { JOIN_API_TOKEN, JOIN_API_URL } from 'astro:env/server';

// El formulario de /entrar/ habla con el panel desde el servidor: el token
// nunca llega al navegador. El panel decide; aquí solo se traduce la respuesta.
const FETCH_TIMEOUT_MS = 8000;

export const CODE_LENGTH = 6;
// Sin 0/O ni 1/I/L, como los que da el servidor al desconectar.
const CODE_PATTERN = /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;

export type AgeRange = 'under_16' | '16_17' | '18_24' | '25_34' | '35_plus';

export const ageRanges: ReadonlyArray<{ value: AgeRange; label: string }> = [
	{ value: 'under_16', label: 'Menos de 16' },
	{ value: '16_17', label: '16 o 17' },
	{ value: '18_24', label: 'De 18 a 24' },
	{ value: '25_34', label: 'De 25 a 34' },
	{ value: '35_plus', label: '35 o más' },
];

export const limits = {
	plansMin: 10,
	plansMax: 1500,
	referralMin: 2,
	referralMax: 300,
	/** El panel manda como mucho 5 preguntas de 5 opciones. */
	quizQuestionsMax: 5,
	quizOptionsMax: 5,
} as const;

export type CodeProblem = 'invalid' | 'expired' | 'superseded' | 'redeemed' | 'invalid_name' | 'rate_limited' | 'unavailable';

/** Una pregunta del test de las normas: el enunciado y las opciones, ya barajadas por el panel. */
export interface QuizQuestion {
	prompt: string;
	options: string[];
}

export type CodeCheck =
	| { status: 'ok'; code: string; minecraftName: string; premium: boolean; expiresAt: Date; questions: QuizQuestion[] }
	| { status: CodeProblem };

export type JoinOutcome =
	| 'auto_accepted'
	| 'pending_non_premium'
	| 'pending_wrong_answer'
	| 'pending_review'
	| 'pending_history'
	| 'rejected_underage';

export type JoinField = 'ageRange' | 'answers' | 'plans' | 'referralSource';

export type SubmitResult =
	| { status: 'ok'; outcome: JoinOutcome }
	| { status: 'invalid_fields'; errors: JoinField[] }
	| { status: CodeProblem };

const problems: readonly CodeProblem[] = ['invalid', 'expired', 'superseded', 'redeemed', 'invalid_name', 'rate_limited'];
const outcomes: readonly JoinOutcome[] = [
	'auto_accepted',
	'pending_non_premium',
	'pending_wrong_answer',
	'pending_review',
	'pending_history',
	'rejected_underage',
];
const fields: readonly JoinField[] = ['ageRange', 'answers', 'plans', 'referralSource'];

/** Lo que alguien teclea a partir de la pantalla de desconexión: minúsculas, espacios y guion. */
export function normalizeCode(input: unknown): string | null {
	if (typeof input !== 'string') return null;
	const code = input.toUpperCase().replace(/[\s-]/g, '');
	return CODE_PATTERN.test(code) ? code : null;
}

export function displayCode(code: string): string {
	return `${code.slice(0, CODE_LENGTH / 2)}-${code.slice(CODE_LENGTH / 2)}`;
}

async function call(body: Record<string, unknown>): Promise<Record<string, unknown> | null> {
	if (!JOIN_API_URL || !JOIN_API_TOKEN) return null;

	try {
		const response = await fetch(JOIN_API_URL, {
			method: 'POST',
			headers: { Authorization: `Bearer ${JOIN_API_TOKEN}`, 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
		});
		if (!response.ok) return null;
		const data: unknown = await response.json();
		return data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
	} catch {
		return null;
	}
}

function problem(status: unknown): CodeProblem {
	return problems.find((candidate) => candidate === status) ?? 'unavailable';
}

export async function checkCode(code: string, ip: string | undefined): Promise<CodeCheck> {
	const data = await call({ action: 'check', code, ip });
	if (!data || data.status !== 'ok') return { status: problem(data?.status) };

	const { minecraftName, premium, expiresAt, questions } = data;
	const expires = typeof expiresAt === 'string' ? new Date(expiresAt) : null;
	if (typeof minecraftName !== 'string' || typeof premium !== 'boolean' || !expires || Number.isNaN(expires.getTime())) {
		return { status: 'unavailable' };
	}

	return { status: 'ok', code, minecraftName, premium, expiresAt: expires, questions: parseQuestions(questions) };
}

/**
 * El test tal como llega del panel. Las respuestas se corrigen por posición,
 * así que ante una sola pregunta mal formada no se enseña ninguna: el panel
 * lo trata como suspendido y lo revisa una persona.
 */
function parseQuestions(value: unknown): QuizQuestion[] {
	if (!Array.isArray(value) || value.length > limits.quizQuestionsMax) return [];
	const questions: QuizQuestion[] = [];
	for (const item of value) {
		const { prompt, options } = (item ?? {}) as { prompt?: unknown; options?: unknown };
		if (
			typeof prompt !== 'string' ||
			!Array.isArray(options) ||
			options.length < 2 ||
			options.length > limits.quizOptionsMax ||
			!options.every((option): option is string => typeof option === 'string')
		) {
			return [];
		}
		questions.push({ prompt, options });
	}
	return questions;
}

/** Lee la opción elegida de cada pregunta (`respuesta-0`, `respuesta-1`…); `null` si quedó en blanco. */
export function readAnswers(read: (name: string) => string, count: number): (number | null)[] {
	return Array.from({ length: Math.min(count, limits.quizQuestionsMax) }, (_, index) => {
		const value = read(`respuesta-${index}`);
		const option = /^[0-9]$/.test(value) ? Number(value) : NaN;
		return option < limits.quizOptionsMax ? option : null;
	});
}

export interface JoinRequest {
	code: string;
	ageRange: string;
	/** Opción elegida en cada pregunta, por posición; `null` si quedó en blanco. */
	answers: (number | null)[];
	plans: string;
	referralSource: string;
}

export async function submitJoin(request: JoinRequest, ip: string | undefined): Promise<SubmitResult> {
	const data = await call({ action: 'submit', ...request, ip });
	if (!data) return { status: 'unavailable' };

	if (data.status === 'ok') {
		const outcome = outcomes.find((candidate) => candidate === data.outcome);
		return outcome ? { status: 'ok', outcome } : { status: 'unavailable' };
	}
	if (data.status === 'invalid_fields') {
		const errors = (Array.isArray(data.errors) ? data.errors : []).filter((error): error is JoinField =>
			fields.includes(error as JoinField),
		);
		// Un código mal formado no debería llegar hasta aquí: se trata como inexistente.
		return errors.length > 0 ? { status: 'invalid_fields', errors } : { status: 'invalid' };
	}
	return { status: problem(data.status) };
}

/** Resultado que se enseña tras enviar, en la URL de la redirección (sin datos de nadie). */
export const resultKinds = ['dentro', 'revision', 'no-premium', 'edad'] as const;
export type ResultKind = (typeof resultKinds)[number];

export function resultKind(outcome: JoinOutcome): ResultKind {
	if (outcome === 'auto_accepted') return 'dentro';
	if (outcome === 'pending_non_premium') return 'no-premium';
	if (outcome === 'rejected_underage') return 'edad';
	return 'revision';
}
