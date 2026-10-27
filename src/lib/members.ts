import { MEMBERS_API_TOKEN, MEMBERS_API_URL } from 'astro:env/server';

const FETCH_TIMEOUT_MS = 3000;
const CACHE_TTL_MS = 60_000;
const ERROR_CACHE_TTL_MS = 10_000;
// El panel confirma por RCON quién está conectado. Si su última lectura es más
// vieja que esto (servidor caído, worker parado), no se marca a nadie como
// conectado en vez de enseñar un dato antiguo.
const ONLINE_STALE_MS = 5 * 60_000;

// Nombres que acepta el servidor vanilla: hasta 16 caracteres ASCII visibles.
// Los no-premium pueden llevar algo más que letras, números y guion bajo.
const NAME_PATTERN = /^[\x21-\x7e]{1,16}$/;

export type MemberStatus = 'trial' | 'member' | 'absence';
export type MemberRole = 'owner' | 'admin' | 'helper';

// El panel aún no lee roles: el staff va fijo aquí, por nombre en minúsculas.
const STAFF_ROLES: Record<string, MemberRole> = {
	ferreritas: 'owner',
	jj99_: 'admin',
	veronicucha: 'helper',
};
const ROLE_ORDER: Record<MemberRole, number> = { owner: 0, admin: 1, helper: 2 };

export interface Member {
	name: string;
	status: MemberStatus;
	role: MemberRole | null;
	online: boolean;
	/** Primera entrada desde que se le aceptó; null en los importados de la whitelist. */
	joinedAt: Date | null;
}

export interface MembersResult {
	ok: boolean;
	maxSlots: number | null;
	members: Member[];
	/** Última vez que el panel confirmó por RCON quién está conectado. */
	checkedAt: Date | null;
	/** false si esa lectura es demasiado vieja para fiarse de `online`. */
	onlineFresh: boolean;
}

type CachedMembers = Omit<MembersResult, 'onlineFresh'>;

let cachedMembers: { expiresAt: number; value: CachedMembers } | null = null;

export async function getMembers(): Promise<MembersResult> {
	const now = Date.now();

	if (!cachedMembers || cachedMembers.expiresAt <= now) {
		const value = await fetchMembers();
		cachedMembers = { expiresAt: now + (value.ok ? CACHE_TTL_MS : ERROR_CACHE_TTL_MS), value };
	}

	const { value } = cachedMembers;
	return {
		...value,
		onlineFresh: value.checkedAt !== null && now - value.checkedAt.getTime() < ONLINE_STALE_MS,
	};
}

async function fetchMembers(): Promise<CachedMembers> {
	const failed: CachedMembers = { ok: false, maxSlots: null, members: [], checkedAt: null };

	if (!MEMBERS_API_URL || !MEMBERS_API_TOKEN) {
		return failed;
	}

	try {
		const response = await fetch(MEMBERS_API_URL, {
			headers: { Authorization: `Bearer ${MEMBERS_API_TOKEN}` },
			signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
		});

		if (!response.ok) {
			return failed;
		}

		const data = (await response.json()) as Record<string, unknown>;
		const members = (Array.isArray(data.members) ? data.members : [])
			.map(parseMember)
			.filter((member): member is Member => member !== null)
			.sort(byListOrder);

		return {
			ok: true,
			maxSlots: typeof data.maxSlots === 'number' && Number.isSafeInteger(data.maxSlots) && data.maxSlots > 0 ? data.maxSlots : null,
			members,
			checkedAt: parseDate(data.updatedAt),
		};
	} catch {
		return failed;
	}
}

function parseMember(raw: unknown): Member | null {
	if (!raw || typeof raw !== 'object') {
		return null;
	}

	const { name, status, online, joinedAt } = raw as Record<string, unknown>;

	if (typeof name !== 'string' || !NAME_PATTERN.test(name)) {
		return null;
	}

	return {
		name,
		// Un estado nuevo que la web aún no conozca se trata como miembro.
		status: status === 'trial' || status === 'absence' ? status : 'member',
		role: STAFF_ROLES[name.toLowerCase()] ?? null,
		online: online === true,
		joinedAt: parseDate(joinedAt),
	};
}

// El staff primero; el resto por antigüedad. Los importados (sin fecha) ya
// estaban antes que el panel, así que van delante.
function byListOrder(left: Member, right: Member): number {
	const leftRank = left.role ? ROLE_ORDER[left.role] : Infinity;
	const rightRank = right.role ? ROLE_ORDER[right.role] : Infinity;

	if (leftRank !== rightRank) {
		return leftRank < rightRank ? -1 : 1;
	}

	const leftTime = left.joinedAt?.getTime() ?? -Infinity;
	const rightTime = right.joinedAt?.getTime() ?? -Infinity;

	if (leftTime !== rightTime) {
		return leftTime < rightTime ? -1 : 1;
	}

	return left.name.localeCompare(right.name, 'es', { sensitivity: 'base' });
}

function parseDate(value: unknown): Date | null {
	if (typeof value !== 'string') {
		return null;
	}

	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}
