import { h } from "../vendor/preact-10";
import { useState } from "../vendor/preact-10/hooks";

export function Prime(props: { max: number }) {
	const [v, set] = useState(0);
	const primes = getPrimes(props.max);
	return (
		<p>
			{primes.join(",")} <button onClick={() => set(v + 1)}>Update</button>
		</p>
	);
}

function getPrimes(max: number) {
	var sieve = [],
		i,
		j,
		primes = [];
	for (i = 2; i <= max; ++i) {
		if (!sieve[i]) {
			// i has not been marked -- it is prime
			primes.push(i);
			for (j = i << 1; j <= max; j += i) {
				sieve[j] = true;
			}
		}
	}
	return primes;
}
