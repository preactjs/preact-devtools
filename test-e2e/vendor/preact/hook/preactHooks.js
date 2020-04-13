!(function (n, t) {
	"object" == typeof exports && "undefined" != typeof module
		? t(exports, require("preact"))
		: "function" == typeof define && define.amd
		? define(["exports", "preact"], t)
		: t((n.preactHooks = {}), n.preact);
})(this, function (n, t) {
	var u,
		r,
		i,
		o = 0,
		f = [],
		e = t.options.__r,
		c = t.options.diffed,
		a = t.options.__c,
		v = t.options.unmount;
	function p(n, u) {
		t.options.__h && t.options.__h(r, n, u);
		var i = r.__H || (r.__H = { __: [], __h: [] });
		return n >= i.__.length && i.__.push({}), i.__[n];
	}
	function d(n) {
		return (o = 1), y(q, n);
	}
	function y(n, t, i) {
		var f = p(u++, o || 2);
		return (
			(o = 0),
			f.__c ||
				((f.__c = r),
				(f.__ = [
					i ? i(t) : q(void 0, t),
					function (t) {
						var u = n(f.__[0], t);
						f.__[0] !== u && ((f.__[0] = u), f.__c.setState({}));
					},
				])),
			f.__
		);
	}
	function s(n, i) {
		var o = p(u++, 4);
		!t.options.t && T(o.__H, i) && ((o.__ = n), (o.__H = i), r.__h.push(o));
	}
	function l(n, t) {
		var r = p(u++, 7);
		return T(r.__H, t) ? ((r.__H = t), (r.__h = n), (r.__ = n())) : r.__;
	}
	function m() {
		f.some(function (n) {
			if (n.__P)
				try {
					n.__H.__h.forEach(h), n.__H.__h.forEach(x), (n.__H.__h = []);
				} catch (u) {
					return (n.__H.__h = []), t.options.__e(u, n.__v), !0;
				}
		}),
			(f = []);
	}
	function h(n) {
		n.u && n.u();
	}
	function x(n) {
		var t = n.__();
		"function" == typeof t && (n.u = t);
	}
	function T(n, t) {
		return (
			!n ||
			t.some(function (t, u) {
				return t !== n[u];
			})
		);
	}
	function q(n, t) {
		return "function" == typeof t ? t(n) : t;
	}
	(t.options.__r = function (n) {
		e && e(n),
			(u = 0),
			(r = n.__c).__H &&
				(r.__H.__h.forEach(h), r.__H.__h.forEach(x), (r.__H.__h = []));
	}),
		(t.options.diffed = function (n) {
			c && c(n);
			var u = n.__c;
			if (u) {
				var r = u.__H;
				r &&
					r.__h.length &&
					((1 !== f.push(u) && i === t.options.requestAnimationFrame) ||
						(
							(i = t.options.requestAnimationFrame) ||
							function (n) {
								var t,
									u = function () {
										clearTimeout(r), cancelAnimationFrame(t), setTimeout(n);
									},
									r = setTimeout(u, 100);
								"undefined" != typeof window && (t = requestAnimationFrame(u));
							}
						)(m));
			}
		}),
		(t.options.__c = function (n, u) {
			u.some(function (n) {
				try {
					n.__h.forEach(h),
						(n.__h = n.__h.filter(function (n) {
							return !n.__ || x(n);
						}));
				} catch (r) {
					u.some(function (n) {
						n.__h && (n.__h = []);
					}),
						(u = []),
						t.options.__e(r, n.__v);
				}
			}),
				a && a(n, u);
		}),
		(t.options.unmount = function (n) {
			v && v(n);
			var u = n.__c;
			if (u) {
				var r = u.__H;
				if (r)
					try {
						r.__.forEach(function (n) {
							return n.u && n.u();
						});
					} catch (n) {
						t.options.__e(n, u.__v);
					}
			}
		}),
		(n.useState = d),
		(n.useReducer = y),
		(n.useEffect = function (n, i) {
			var o = p(u++, 3);
			!t.options.t &&
				T(o.__H, i) &&
				((o.__ = n), (o.__H = i), r.__H.__h.push(o));
		}),
		(n.useLayoutEffect = s),
		(n.useRef = function (n) {
			return (
				(o = 5),
				l(function () {
					return { current: n };
				}, [])
			);
		}),
		(n.useImperativeHandle = function (n, t, u) {
			(o = 6),
				s(
					function () {
						"function" == typeof n ? n(t()) : n && (n.current = t());
					},
					null == u ? u : u.concat(n),
				);
		}),
		(n.useMemo = l),
		(n.useCallback = function (n, t) {
			return (
				(o = 8),
				l(function () {
					return n;
				}, t)
			);
		}),
		(n.useContext = function (n) {
			var t = r.context[n.__c];
			if (!t) return n.__;
			var i = p(u++, 9);
			return null == i.__ && ((i.__ = !0), t.sub(r)), t.props.value;
		}),
		(n.useDebugValue = function (n, u) {
			t.options.useDebugValue && t.options.useDebugValue(u ? u(n) : n);
		}),
		(n.useErrorBoundary = function (n) {
			var t = p(u++, 10),
				i = d();
			return (
				(t.__ = n),
				r.componentDidCatch ||
					(r.componentDidCatch = function (n) {
						t.__ && t.__(n), i[1](n);
					}),
				[
					i[0],
					function () {
						i[1](void 0);
					},
				]
			);
		});
});
//# sourceMappingURL=hooks.umd.js.map
