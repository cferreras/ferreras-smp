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
	answerMax: 120,
	plansMin: 10,
	plansMax: 1500,
	referralMin: 2,
	referralMax: 300,
} as const;

export type CodeProblem = 'invalid' | 'expired' | 'superseded' | 'redeemed' | 'invalid_name' | 'rate_limited' | 'unavailable';

export type CodeCheck =
	| { status: 'ok'; code: string; minecraftName: string; premium: boolean; expiresAt: Date; question: string | null }
	| { status: CodeProblem };

export type JoinOutcome =
	| 'auto_accepted'
	| 'pending_non_premium'
	| 'pending_wrong_answer'
	| 'pending_review'
	| 'pending_history'
	| 'rejected_underage';

export type JoinField = 'ageRange' | 'answer' | 'plans' | 'referralSource';

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
const fields: readonly JoinField[] = ['ageRange', 'answer', 'plans', 'referralSource'];

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

	const { minecraftName, premium, expiresAt, question } = data;
	const expires = typeof expiresAt === 'string' ? new Date(expiresAt) : null;
	if (typeof minecraftName !== 'string' || typeof premium !== 'boolean' || !expires || Number.isNaN(expires.getTime())) {
		return { status: 'unavailable' };
	}
	const prompt =
		question && typeof question === 'object' && typeof (question as { prompt?: unknown }).prompt === 'string'
			? (question as { prompt: string }).prompt
			: null;

	return { status: 'ok', code, minecraftName, premium, expiresAt: expires, question: prompt };
}

export interface JoinRequest {
	code: string;
	ageRange: string;
	answer: string;
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
