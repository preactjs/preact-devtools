var n,
	r,
	t = require('preact');
Promise.prototype.then.bind(Promise.resolve());
var o,
	u = 0,
	e = [],
	i = t.options.__b,
	c = t.options.__r,
	f = t.options.diffed,
	a = t.options.__c,
	v = t.options.unmount;
function s(n, o) {
	t.options.__h && t.options.__h(r, n, u || o), (u = 0);
	var e = r.data.__H || (r.data.__H = { __: [], __h: [] });
	return n >= e.__.length && e.__.push({}), e.__[n];
}
function p(n) {
	return (u = 1), l(T, n);
}
function l(t, o, u) {
	var e = s(n++, 2);
	return (
		(e.t = t),
		e.__i ||
			((e.__ = [
				u ? u(o) : T(void 0, o),
				(n) => {
					var r = e.t(e.__[0], n);
					e.__[0] !== r && ((e.__ = [r, e.__[1]]), e.__i.rerender(e.__i));
				}
			]),
			(e.__i = r)),
		e.__
	);
}
function m(o, u) {
	var e = s(n++, 4);
	!t.options.__s &&
		F(e.__H, u) &&
		((e.__ = o), (e.__H = u), null == r.__h && (r.__h = []), r.__h.push(e));
}
function x(r, t) {
	var o = s(n++, 7);
	return F(o.__H, t) && ((o.__ = r()), (o.__H = t), (o.__h = r)), o.__;
}
(t.options.__b = (n, t) => {
	(r = null), i && i(n, t);
}),
	(t.options.__r = (t) => {
		c && c(t),
			(n = 0),
			(r = t).data &&
				r.data.__H &&
				(r.data.__H.__h.forEach(q),
				r.data.__H.__h.forEach(A),
				(r.data.__H.__h = []));
	}),
	(t.options.diffed = (n) => {
		f && f(n),
			n.data &&
				n.data.__H &&
				n.data.__H.__h.length &&
				((1 !== e.push(n) && o === t.options.requestAnimationFrame) ||
					((o = t.options.requestAnimationFrame) || d)(h));
	}),
	(t.options.__c = (n, r) => {
		r.some((n) => {
			try {
				n.__h.forEach(q), (n.__h = n.__h.filter((n) => !n.__ || A(n)));
			} catch (o) {
				r.some((n) => {
					n.__h && (n.__h = []);
				}),
					(r = []),
					t.options.__e(o, n);
			}
		}),
			a && a(n, r);
	}),
	(t.options.unmount = (n) => {
		var r;
		v && v(n),
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
var y = t.options.__e;
function h() {
	var n;
	for (e.sort((n, r) => n.__b - r.__b); (n = e.pop()); )
		if (2048 & ~n.flags)
			try {
				n.data.__H.__h.forEach(q),
					n.data.__H.__h.forEach(A),
					(n.data.__H.__h = []);
			} catch (r) {
				(n.data.__H.__h = []), t.options.__e(r, n);
			}
}
t.options.__e = function (n, r) {
	for (var t = r; (t = t.__); )
		if (t.data && t.data.__e) return t.data.__e(n, r);
	y(n, r);
};
var _ = 'function' == typeof requestAnimationFrame;
function d(n) {
	var r,
		t = () => {
			clearTimeout(o), _ && cancelAnimationFrame(r), setTimeout(n);
		},
		o = setTimeout(t, 100);
	_ && (r = requestAnimationFrame(t));
}
function q(n) {
	var t = r,
		o = n.__c;
	'function' == typeof o && ((n.__c = void 0), o()), (r = t);
}
function A(n) {
	var t = r;
	(n.__c = n.__()), (r = t);
}
function F(n, r) {
	return !n || n.length !== r.length || r.some((r, t) => r !== n[t]);
}
function T(n, r) {
	return 'function' == typeof r ? r(n) : r;
}
(exports.useCallback = function (n, r) {
	return (u = 8), x(() => n, r);
}),
	(exports.useContext = function (t) {
		var o = (function (n) {
				for (var t = r.c, o = r.__; null == t && o; ) (t = o.c), (o = o.__);
				return t;
			})()[t.__c],
			u = s(n++, 9);
		return (
			(u.c = t),
			o ? (null == u.__ && ((u.__ = !0), o.s.add(r)), o.props.value) : t.__
		);
	}),
	(exports.useDebugValue = function (n, r) {
		t.options.useDebugValue && t.options.useDebugValue(r ? r(n) : n);
	}),
	(exports.useEffect = function (o, u) {
		var e = s(n++, 3);
		!t.options.__s &&
			F(e.__H, u) &&
			((e.__ = o), (e.__H = u), r.data.__H.__h.push(e));
	}),
	(exports.useErrorBoundary = function (t) {
		var o = s(n++, 10),
			u = p();
		return (
			(o.__ = t),
			r.data.__e ||
				(r.data.__e = (n) => {
					o.__ && o.__(n), u[1](n);
				}),
			[
				u[0],
				() => {
					u[1](void 0);
				}
			]
		);
	}),
	(exports.useImperativeHandle = function (n, r, t) {
		(u = 6),
			m(
				() => {
					'function' == typeof n ? n(r()) : n && (n.current = r());
				},
				null == t ? t : t.concat(n)
			);
	}),
	(exports.useLayoutEffect = m),
	(exports.useMemo = x),
	(exports.useReducer = l),
	(exports.useRef = function (n) {
		return (u = 5), x(() => ({ current: n }), []);
	}),
	(exports.useState = p);
//# sourceMappingURL=hooks.js.map
