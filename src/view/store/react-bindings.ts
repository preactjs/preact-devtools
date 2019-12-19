import { createContext } from "preact";
import { useEffect, useContext, useState, useMemo, useRef } from "preact/hooks";
import { Store } from "./types";
import { EmitFn } from "../../adapter/hook";
import { watch, Observable } from "../valoo";

export const AppCtx = createContext<Store>(null as any);
export const EmitCtx = createContext<EmitFn>(() => null);

export const useEmitter = () => useContext(EmitCtx);
export const useStore = () => useContext(AppCtx);

export function useObserver<T>(fn: () => T): T {
	let [_, set] = useState(0);
	let count = useRef(0);
	let tmp = useRef<any>(null as any);
	let ref = useRef<Observable<T>>(tmp.current || (tmp.current = watch(fn)));

	const dispose = useMemo(() => {
		let disp = ref.current.on(() => {
			set((count.current = count.current + 1));
		});
		return () => {
			disp();
			ref.current._disposers.forEach(disp => disp());
		};
	}, []);

	useEffect(() => {
		return () => dispose();
	}, []);

	return ref.current.$;
}
