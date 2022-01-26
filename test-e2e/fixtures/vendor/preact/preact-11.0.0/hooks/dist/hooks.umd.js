!(function (n, t) {
	'object' == typeof exports && 'undefined' != typeof module
		? t(exports, require('preact'))
		: 'function' == typeof define && define.amd
		? define(['exports', 'preact'], t)
		: t(((n || self).preactHooks = {}), n.preact);
})(this, function (n, t) {
	var r, e;
	Promise.prototype.then.bind(Promise.resolve());
	var o,
		u = 0,
		i = [],
		f = t.options.__b,
		c = t.options.__r,
		a = t.options.diffed,
		v = t.options.__c,
		l = t.options.unmount;
	function p(n, r) {
		t.options.__h && t.options.__h(e, n, u || r), (u = 0);
		var o = e.data.__H || (e.data.__H = { __: [], __h: [] });
		return n >= o.__.length && o.__.push({}), o.__[n];
	}
	function s(n) {
		return (u = 1), m(F, n);
	}
	function m(n, t, o) {
		var u = p(r++, 2);
		return (
			(u.t = n),
			u.__i ||
				((u.__ = [
					o ? o(t) : F(void 0, t),
					(n) => {
						var t = u.t(u.__[0], n);
						u.__[0] !== t && ((u.__ = [t, u.__[1]]), u.__i.rerender(u.__i));
					}
				]),
				(u.__i = e)),
			u.__
		);
	}
	function d(n, o) {
		var u = p(r++, 4);
		!t.options.__s &&
			A(u.__H, o) &&
			((u.__ = n), (u.__H = o), null == e.__h && (e.__h = []), e.__h.push(u));
	}
	function y(n, t) {
		var e = p(r++, 7);
		return A(e.__H, t) && ((e.__ = n()), (e.__H = t), (e.__h = n)), e.__;
	}
	(t.options.__b = (n, t) => {
		(e = null), f && f(n, t);
	}),
		(t.options.__r = (n) => {
			c && c(n),
				(r = 0),
				(e = n).data &&
					e.data.__H &&
					(e.data.__H.__h.forEach(q),
					e.data.__H.__h.forEach(x),
					(e.data.__H.__h = []));
		}),
		(t.options.diffed = (n) => {
			a && a(n),
				n.data &&
					n.data.__H &&
					n.data.__H.__h.length &&
					((1 !== i.push(n) && o === t.options.requestAnimationFrame) ||
						((o = t.options.requestAnimationFrame) || b)(T));
		}),
		(t.options.__c = (n, r) => {
			r.some((n) => {
				try {
					n.__h.forEach(q), (n.__h = n.__h.filter((n) => !n.__ || x(n)));
				} catch (e) {
					r.some((n) => {
						n.__h && (n.__h = []);
					}),
						(r = []),
						t.options.__e(e, n);
				}
			}),
				v && v(n, r);
		}),
		(t.options.unmount = (n) => {
			var r;
			l && l(n),
				n.data &&
					n.data.__H &&
					(n.data.__H.__.forEach((n) => {
						try {
							q(n);
						} catch (n) {
							r = n;
						}
					}),
					r && t.options.__e(r, n));
		});
	var h = t.options.__e;
	function T() {
		var n;
		for (i.sort((n, t) => n.__b - t.__b); (n = i.pop()); )
			if (2048 & ~n.flags)
				try {
					n.data.__H.__h.forEach(q),
						n.data.__H.__h.forEach(x),
						(n.data.__H.__h = []);
				} catch (r) {
					(n.data.__H.__h = []), t.options.__e(r, n);
				}
	}
	t.options.__e = function (n, t) {
		for (var r = t; (r = r.__); )
			if (r.data && r.data.__e) return r.data.__e(n, t);
		h(n, t);
	};
	var _ = 'function' == typeof requestAnimationFrame;
	function b(n) {
		var t,
			r = () => {
				clearTimeout(e), _ && cancelAnimationFrame(t), setTimeout(n);
			},
			e = setTimeout(r, 100);
		_ && (t = requestAnimationFrame(r));
	}
	function q(n) {
		var t = e,
			r = n.__c;
		'function' == typeof r && ((n.__c = void 0), r()), (e = t);
	}
	function x(n) {
		var t = e;
		(n.__c = n.__()), (e = t);
	}
	function A(n, t) {
		return !n || n.length !== t.length || t.some((t, r) => t !== n[r]);
	}
	function F(n, t) {
		return 'function' == typeof t ? t(n) : t;
	}
	(n.useCallback = function (n, t) {
		return (u = 8), y(() => n, t);
	}),
		(n.useContext = function (n) {
			var t = (function (n) {
					for (var t = n.c, r = n.__; null == t && r; ) (t = r.c), (r = r.__);
					return t;
				})(e)[n.__c],
				o = p(r++, 9);
			return (
				(o.c = n),
				t ? (null == o.__ && ((o.__ = !0), t.s.add(e)), t.props.value) : n.__
			);
		}),
		(n.useDebugValue = function (n, r) {
			t.options.useDebugValue && t.options.useDebugValue(r ? r(n) : n);
		}),
		(n.useEffect = function (n, o) {
			var u = p(r++, 3);
			!t.options.__s &&
				A(u.__H, o) &&
				((u.__ = n), (u.__H = o), e.data.__H.__h.push(u));
		}),
		(n.useErrorBoundary = function (n) {
			var t = p(r++, 10),
				o = s();
			return (
				(t.__ = n),
				e.data.__e ||
					(e.data.__e = (n) => {
						t.__ && t.__(n), o[1](n);
					}),
				[
					o[0],
					() => {
						o[1](void 0);
					}
				]
			);
		}),
		(n.useImperativeHandle = function (n, t, r) {
			(u = 6),
				d(
					() => {
						'function' == typeof n ? n(t()) : n && (n.current = t());
					},
					null == r ? r : r.concat(n)
				);
		}),
		(n.useLayoutEffect = d),
		(n.useMemo = y),
		(n.useReducer = m),
		(n.useRef = function (n) {
			return (u = 5), y(() => ({ current: n }), []);
		}),
		(n.useState = s);
});
//# sourceMappingURL=hooks.umd.js.map
