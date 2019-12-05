!(function(n, t) {
	'object' == typeof exports && 'undefined' != typeof module
		? t(exports, require('preact'))
		: 'function' == typeof define && define.amd
		? define(['exports', 'preact'], t)
		: t((n.preactHooks = {}), n.preact);
})(this, function(n, t) {
	var u,
		i,
		r,
		o = [],
		e = t.options.__r,
		f = t.options.diffed,
		c = t.options.__c,
		a = t.options.unmount;
	function v(n) {
		t.options.__h && t.options.__h(i);
		var u = i.__H || (i.__H = { t: [], u: [] });
		return n >= u.t.length && u.t.push({}), u.t[n];
	}
	function p(n, t, r) {
		var o = v(u++);
		return (
			o.__c ||
				((o.__c = i),
				(o.i = [
					r ? r(t) : T(void 0, t),
					function(t) {
						var u = n(o.i[0], t);
						o.i[0] !== u && ((o.i[0] = u), o.__c.setState({}));
					}
				])),
			o.i
		);
	}
	function d(n, t) {
		var r = v(u++);
		x(r.o, t) && ((r.i = n), (r.o = t), i.__h.push(r));
	}
	function s(n, t) {
		var i = v(u++);
		return x(i.o, t) ? ((i.o = t), (i.v = n), (i.i = n())) : i.i;
	}
	function l() {
		o.some(function(n) {
			n.__P && (n.__H.u.forEach(m), n.__H.u.forEach(y), (n.__H.u = []));
		}),
			(o = []);
	}
	function m(n) {
		n.p && n.p();
	}
	function y(n) {
		var t = n.i();
		'function' == typeof t && (n.p = t);
	}
	function x(n, t) {
		return (
			!n ||
			t.some(function(t, u) {
				return t !== n[u];
			})
		);
	}
	function T(n, t) {
		return 'function' == typeof t ? t(n) : t;
	}
	(t.options.__r = function(n) {
		e && e(n),
			(u = 0),
			(i = n.__c).__H &&
				(i.__H.u.forEach(m), i.__H.u.forEach(y), (i.__H.u = []));
	}),
		(t.options.diffed = function(n) {
			f && f(n);
			var u = n.__c;
			if (u) {
				var i = u.__H;
				i &&
					i.u.length &&
					((1 !== o.push(u) && r === t.options.requestAnimationFrame) ||
						(
							(r = t.options.requestAnimationFrame) ||
							function(n) {
								var t,
									u = function() {
										clearTimeout(i), cancelAnimationFrame(t), setTimeout(n);
									},
									i = setTimeout(u, 100);
								'undefined' != typeof window && (t = requestAnimationFrame(u));
							}
						)(l));
			}
		}),
		(t.options.__c = function(n, t) {
			t.some(function(n) {
				n.__h.forEach(m),
					(n.__h = n.__h.filter(function(n) {
						return !n.i || y(n);
					}));
			}),
				c && c(n, t);
		}),
		(t.options.unmount = function(n) {
			a && a(n);
			var t = n.__c;
			if (t) {
				var u = t.__H;
				u &&
					u.t.forEach(function(n) {
						return n.p && n.p();
					});
			}
		}),
		(n.useState = function(n) {
			return p(T, n);
		}),
		(n.useReducer = p),
		(n.useEffect = function(n, t) {
			var r = v(u++);
			x(r.o, t) && ((r.i = n), (r.o = t), i.__H.u.push(r));
		}),
		(n.useLayoutEffect = d),
		(n.useRef = function(n) {
			return s(function() {
				return { current: n };
			}, []);
		}),
		(n.useImperativeHandle = function(n, t, u) {
			d(
				function() {
					'function' == typeof n ? n(t()) : n && (n.current = t());
				},
				null == u ? u : u.concat(n)
			);
		}),
		(n.useMemo = s),
		(n.useCallback = function(n, t) {
			return s(function() {
				return n;
			}, t);
		}),
		(n.useContext = function(n) {
			var t = i.context[n.__c];
			if (!t) return n.__;
			var r = v(u++);
			return null == r.i && ((r.i = !0), t.sub(i)), t.props.value;
		}),
		(n.useDebugValue = function(n, u) {
			t.options.useDebugValue && t.options.useDebugValue(u ? u(n) : n);
		});
});
//# sourceMappingURL=hooks.umd.js.map
