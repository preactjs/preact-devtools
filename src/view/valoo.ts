type Fn<T> = (v: T) => void;
export type Observable<T = any> = {
	(): T;
	(v: T): T;
	on(fn: (value: T) => void): Disposer;
};
type Disposer = () => void;

// TODO: This is fine for an MVP but not a goid choice for production due to
// missing features like proper unsubscription handling
export function valoo<T>(v: T): Observable<T> {
	const cb: Array<Fn<T> | null> = [];
	function value(c: T) {
		if (arguments.length)
			cb.map(f => {
				f && f((v = c));
			});
		return v;
	}
	value.on = (c: Fn<T>) => {
		const i = cb.push(c) - 1;
		return () => {
			cb[i] = 0 as any;
		};
	};
	return value as any;
}

export function track<R>(fn: () => R, subs: Observable[]): Observable<R> {
	let v = subs.map(x => x());
	let out = valoo(fn());
	subs.forEach(x => {
		x.on(n => {
			const idx = subs.indexOf(x);
			v[idx] = n;
			out(fn());
		});
	});
	return out;
}

// export function proxify<T extends object>(obj: T): T {
// 	for (const key in obj) {
//     const desc = Object.getOwnPropertyDescriptor(obj, key)!;
//     if (desc.get) {
//       const fn = desc.get;
//       Object.defineProperty(obj, key, {
//         get() {
//           return fn
//         }
//       })
//       // computed
//     }
//     else if (typeof obj[key] !== "function") {

//     }
//   }
// }
