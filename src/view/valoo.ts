export type Disposer = () => void;

export type Observable<T = any> = {
	$: T;
	on(fn: (value: T) => void): Disposer;
	update(fn?: (value: T) => T | void): T;
	_disposers: Disposer[];
};

/**
 * Base observable primitive.
 */
export function valoo<T>(v: T): Observable<T> {
	// In an earlier version we used a function to read and write values:
	//
	//   read: foo()
	//   write: foo(2)
	//
	// The problem with that is that TypeScript is unable to discriminate
	// types automatically because from the perspective of TypeScript it's
	// always a new function call. This is really cumbersome when null-types
	// are involved.
	//
	//   const foo = valoo<null | number>(2)
	//   if (foo()!=null) {
	//     // Compilation Error, because the return value
	//     // of foo() could be null
	//     console.log(foo().toFixed(2));
	//   }
	//
	// Long story short: This is why we're using getters and setters now.
	const cb: Array<((v: T) => void) | null> = [];
	const obs: Observable = {
		get $(): T {
			tracking.add(obs);
			return v;
		},
		set $(c: T) {
			v = c;
			cb.forEach(f => f && f(v));
		},
		on(c: (v: T) => void) {
			const i = cb.push(c) - 1;
			return () => (cb[i] = null);
		},
		update(fn?: (v: T) => T | void) {
			const res = fn ? fn(v) : undefined;
			obs.$ = res !== undefined ? res : v;
		},
		_disposers: [],
	};

	return obs;
}

/**
 * We'll use this variable to track used dependencies
 */
let tracking = new Set<Observable>();

/**
 * Track used observables automatically and re-execute the callback
 * whenever one of the dependencies changes.
 */
export function watch<R>(fn: () => R): Observable<R> {
	let out = valoo(null as any);

	// Perf: Don't allocate this in update, because it's much better
	// to reuse the Set and just mutate + clear it for an update cycle.
	let tracker = new Set<Observable>();

	const update = () => {
		let oldTracker = tracking;
		tracking = tracker;

		// Unsubscribe previous listeners
		out._disposers.forEach(fn => fn());
		out._disposers = [];

		// Call the actual function
		out.$ = fn();

		// Resubscribe to listeners
		tracking.forEach(x => {
			let disp = x.on(update);
			out._disposers.push(disp);
		});

		tracker.clear();
		tracking = oldTracker;
	};

	update();
	return out;
}
