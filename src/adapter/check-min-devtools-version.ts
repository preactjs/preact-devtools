import parseSemverish from "./parse-semverish";

export default function checkMinDevtoolsVersion(
	currentDevtoolsVersion: string,
	minDevtoolsVersion: string,
	preactVersion: string,
): boolean {
	const minDevtoolsVersionMatch = parseSemverish(minDevtoolsVersion, false);

	if (!minDevtoolsVersionMatch) {
		// TODO(Sven): Can we show these messages also in the preact popup?!
		console.error(
			`[PREACT DEVTOOLS] Could not parse minDevtoolsVersion ${minDevtoolsVersion}`,
		);
		return false;
	}

	const currentDevtoolsVersionMatch = parseSemverish(
		currentDevtoolsVersion,
		false,
	);

	if (!currentDevtoolsVersionMatch) {
		console.error(
			`[PREACT DEVTOOLS] Could not parse currentDevtoolsVersion ${currentDevtoolsVersion}`,
		);
		return false;
	}

	if (
		minDevtoolsVersionMatch.major > currentDevtoolsVersionMatch.major ||
		(minDevtoolsVersionMatch.major === currentDevtoolsVersionMatch.major &&
			(minDevtoolsVersionMatch.minor > currentDevtoolsVersionMatch.minor ||
				(minDevtoolsVersionMatch.minor === currentDevtoolsVersionMatch.minor &&
					minDevtoolsVersionMatch.patch > currentDevtoolsVersionMatch.patch)))
	) {
		console.error(
			`[PREACT DEVTOOLS] Preact version ${preactVersion} requires devtools ${minDevtoolsVersion} but you currently have ${currentDevtoolsVersionMatch} installed!`,
		);
		return false;
	}

	return true;
}
