import type { APIRoute } from 'astro';

export const prerender = false;

const GITHUB_CONTRIBS_BASE_URL = 'https://github.com';
const CACHE_TTL_MS = 60 * 1000;
const FETCH_TIMEOUT_MS = 7 * 1000;
const USERNAME_PATTERN = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;

type CacheEntry = {
	body: string;
	expiresAt: number;
};

const contributionCache = new Map<string, CacheEntry>();

function createJsonResponse(payload: unknown, status: number, cacheHit = false): Response {
	return new Response(JSON.stringify(payload), {
		status,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=30',
			'X-Cache': cacheHit ? 'HIT' : 'MISS',
		},
	});
}

function isValidUsername(username: string): boolean {
	return USERNAME_PATTERN.test(username);
}

export const GET: APIRoute = async ({ params }) => {
	const username = params.username?.trim();

	if (!username || !isValidUsername(username)) {
		return createJsonResponse(
			{ error: 'Invalid GitHub username format.' },
			400,
		);
	}

	const now = Date.now();
	const cached = contributionCache.get(username);
	if (cached && cached.expiresAt > now) {
		return createJsonResponse(JSON.parse(cached.body), 200, true);
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

	try {
		const upstreamUrl = `${GITHUB_CONTRIBS_BASE_URL}/${username}.contribs`;
		const upstreamResponse = await fetch(upstreamUrl, {
			headers: {
				Accept: 'application/json',
				'User-Agent': 'mona-mayhem-contributions-proxy',
			},
			signal: controller.signal,
		});

		if (upstreamResponse.status === 404) {
			return createJsonResponse({ error: 'GitHub user not found.' }, 404);
		}

		if (!upstreamResponse.ok) {
			return createJsonResponse(
				{ error: 'Failed to fetch contribution data from GitHub.' },
				502,
			);
		}

		const body = await upstreamResponse.text();
		let parsedBody: unknown;
		try {
			parsedBody = JSON.parse(body);
		} catch {
			return createJsonResponse(
				{ error: 'GitHub returned an invalid JSON response.' },
				502,
			);
		}

		contributionCache.set(username, {
			body,
			expiresAt: now + CACHE_TTL_MS,
		});

		return createJsonResponse(parsedBody, 200);
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			return createJsonResponse(
				{ error: 'Request to GitHub timed out.' },
				504,
			);
		}

		return createJsonResponse(
			{ error: 'Unexpected server error while fetching contribution data.' },
			500,
		);
	} finally {
		clearTimeout(timeout);
	}
};
