import { createContext } from "preact";
import { useEffect, useContext, useState } from "preact/hooks";
import { Store } from "./types";
import { EmitFn } from "../../adapter/hook";
import { watch } from "../valoo";

export const AppCtx = createContext<Store>(null as any);
export const EmitCtx = createContext<EmitFn>(() => null);

export const useEmitter = () => useContext(EmitCtx);
export const useStore = () => useContext(AppCtx);

export function useObserver<T>(fn: () => T): T {
	let [i, setI] = useState(0);

	useEffect(() => {
		let v = watch(fn);
		let disp = v.on(() => {
			setI(i + 1);
		});
		return () => {
			disp();
			v._disposers.forEach(disp => disp());
		};
	}, [i, fn]);

	return fn();
}
