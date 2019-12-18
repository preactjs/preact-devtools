var n,
	t,
	r,
	u = require('preact'),
	o = [],
	i = u.options.__r,
	e = u.options.diffed,
	f = u.options.__c,
	c = u.options.unmount;
function a(n) {
	u.options.__h && u.options.__h(t);
	var r = t.__H || (t.__H = { t: [], u: [] });
	return n >= r.t.length && r.t.push({}), r.t[n];
}
function p(r, u, o) {
	var i = a(n++);
	return (
		i.__c ||
			((i.__c = t),
			(i.o = [
				o ? o(u) : y(void 0, u),
				function(n) {
					var t = r(i.o[0], n);
					i.o[0] !== t && ((i.o[0] = t), i.__c.setState({}));
				}
			])),
		i.o
	);
}
function v(r, u) {
	var o = a(n++);
	d(o.i, u) && ((o.o = r), (o.i = u), t.__h.push(o));
}
function s(t, r) {
	var u = a(n++);
	return d(u.i, r) ? ((u.i = r), (u.p = t), (u.o = t())) : u.o;
}
function x() {
	o.some(function(n) {
		n.__P && (n.__H.u.forEach(l), n.__H.u.forEach(m), (n.__H.u = []));
	}),
		(o = []);
}
function l(n) {
	n.v && n.v();
}
function m(n) {
	var t = n.o();
	'function' == typeof t && (n.v = t);
}
function d(n, t) {
	return (
		!n ||
		t.some(function(t, r) {
			return t !== n[r];
		})
	);
}
function y(n, t) {
	return 'function' == typeof t ? t(n) : t;
}
(u.options.__r = function(r) {
	i && i(r),
		(n = 0),
		(t = r.__c).__H && (t.__H.u.forEach(l), t.__H.u.forEach(m), (t.__H.u = []));
}),
	(u.options.diffed = function(n) {
		e && e(n);
		var t = n.__c;
		if (t) {
			var i = t.__H;
			i &&
				i.u.length &&
				((1 !== o.push(t) && r === u.options.requestAnimationFrame) ||
					(
						(r = u.options.requestAnimationFrame) ||
						function(n) {
							var t,
								r = function() {
									clearTimeout(u), cancelAnimationFrame(t), setTimeout(n);
								},
								u = setTimeout(r, 100);
							'undefined' != typeof window && (t = requestAnimationFrame(r));
						}
					)(x));
		}
	}),
	(u.options.__c = function(n, t) {
		t.some(function(n) {
			n.__h.forEach(l),
				(n.__h = n.__h.filter(function(n) {
					return !n.o || m(n);
				}));
		}),
			f && f(n, t);
	}),
	(u.options.unmount = function(n) {
		c && c(n);
		var t = n.__c;
		if (t) {
			var r = t.__H;
			r &&
				r.t.forEach(function(n) {
					return n.v && n.v();
				});
		}
	}),
	(exports.useState = function(n) {
		return p(y, n);
	}),
	(exports.useReducer = p),
	(exports.useEffect = function(r, u) {
		var o = a(n++);
		d(o.i, u) && ((o.o = r), (o.i = u), t.__H.u.push(o));
	}),
	(exports.useLayoutEffect = v),
	(exports.useRef = function(n) {
		return s(function() {
			return { current: n };
		}, []);
	}),
	(exports.useImperativeHandle = function(n, t, r) {
		v(
			function() {
				'function' == typeof n ? n(t()) : n && (n.current = t());
			},
			null == r ? r : r.concat(n)
		);
	}),
	(exports.useMemo = s),
	(exports.useCallback = function(n, t) {
		return s(function() {
			return n;
		}, t);
	}),
	(exports.useContext = function(r) {
		var u = t.context[r.__c];
		if (!u) return r.__;
		var o = a(n++);
		return null == o.o && ((o.o = !0), u.sub(t)), u.props.value;
	}),
	(exports.useDebugValue = function(n, t) {
		u.options.useDebugValue && u.options.useDebugValue(t ? t(n) : n);
	});
//# sourceMappingURL=hooks.js.map
