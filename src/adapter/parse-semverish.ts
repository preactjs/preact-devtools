const MAJOR = 1;
const MINOR = 2;
const PATCH = 3;
const PRERELEASE = 5;
const PRERELEASE_TAG = 5;
const PRERELEASE_VERSION = 6;
const PATTERN_MAJOR_MINOR_PATCH = "([0-9]+).([0-9]+).([0-9]+)";
const REGEXP_SEMVERISH_WITH_PRERELEASE = new RegExp(
	`^${PATTERN_MAJOR_MINOR_PATCH}(-([a-z]+)\.([0-9]+))?$`,
	"i",
);
const REGEXP_SEMVERISH_WITHOUT_PRERELEASE = new RegExp(
	`^${PATTERN_MAJOR_MINOR_PATCH}$`,
);

/**
 * semver-ish parsing based on https://github.com/npm/node-semver/blob/master/semver.js
 *
 * @param version Version to parse
 * @param allowPreRelease Flag to indicate whether pre-releases should be allowed & parsed (e.g. -rc.1)
 */
export default function parseSemverish(
	version: string,
	allowPreRelease: boolean,
): {
	major: number;
	minor: number;
	patch: number;
	preRelease?: { tag: string; version: number };
} | null {
	const match = version.match(
		allowPreRelease
			? REGEXP_SEMVERISH_WITH_PRERELEASE
			: REGEXP_SEMVERISH_WITHOUT_PRERELEASE,
	);

	if (match) {
		let preRelease = undefined;
		if (match[PRERELEASE]) {
			preRelease = {
				tag: match[PRERELEASE_TAG],
				version: +match[PRERELEASE_VERSION],
			};
		}

		return {
			major: +match[MAJOR],
			minor: +match[MINOR],
			patch: +match[PATCH],
			preRelease,
		};
	}

	return null;
}
