// Preact/hooks 10.0.0-rc.0
!(function (n, t) {
	"object" == typeof exports && "undefined" != typeof module
		? t(exports, require("preact"))
		: "function" == typeof define && define.amd
		? define(["exports", "preact"], t)
		: t((n.preactHooks = {}), n.preact);
})(this, function (n, t) {
	var r,
		u,
		e = [],
		i = t.options.__r;
	t.options.__r = function (n) {
		i && i(n), (r = 0), (u = n.__c).__H && (u.__H.t = s(u.__H.t));
	};
	var f = t.options.diffed;
	t.options.diffed = function (n) {
		f && f(n);
		var t = n.__c;
		if (t) {
			var r = t.__H;
			r && (r.u = s(r.u));
		}
	};
	var o = t.options.unmount;
	function c(n) {
		t.options.__h && t.options.__h(u);
		var r = u.__H || (u.__H = { i: [], t: [], u: [] });
		return n >= r.i.length && r.i.push({}), r.i[n];
	}
	function a(n, t, e) {
		var i = c(r++);
		return (
			i.__c ||
				((i.__c = u),
				(i.o = [
					e ? e(t) : x(null, t),
					function (t) {
						var r = n(i.o[0], t);
						i.o[0] !== r && ((i.o[0] = r), i.__c.setState({}));
					},
				])),
			i.o
		);
	}
	function v(n, t) {
		var u = c(r++);
		return y(u.v, t) ? ((u.v = t), (u.p = n), (u.o = n())) : u.o;
	}
	t.options.unmount = function (n) {
		o && o(n);
		var t = n.__c;
		if (t) {
			var r = t.__H;
			r &&
				r.i.forEach(function (n) {
					return n.s && n.s();
				});
		}
	};
	var p = function () {};
	function d() {
		e.some(function (n) {
			(n.l = !1), n.__P && (n.__H.t = s(n.__H.t));
		}),
			(e = []);
	}
	function s(n) {
		return n.forEach(l), n.forEach(m), [];
	}
	function l(n) {
		n.s && n.s();
	}
	function m(n) {
		var t = n.o();
		"function" == typeof t && (n.s = t);
	}
	function y(n, t) {
		return (
			!n ||
			t.some(function (t, r) {
				return t !== n[r];
			})
		);
	}
	function x(n, t) {
		return "function" == typeof t ? t(n) : t;
	}
	"undefined" != typeof window &&
		(p = function (n) {
			!n.l &&
				(n.l = !0) &&
				1 === e.push(n) &&
				(
					t.options.requestAnimationFrame ||
					function (n) {
						var t = function () {
								clearTimeout(r), cancelAnimationFrame(u), setTimeout(n);
							},
							r = setTimeout(t, 100),
							u = requestAnimationFrame(t);
					}
				)(d);
		}),
		(n.useState = function (n) {
			return a(x, n);
		}),
		(n.useReducer = a),
		(n.useEffect = function (n, t) {
			var e = c(r++);
			y(e.v, t) && ((e.o = n), (e.v = t), u.__H.t.push(e), p(u));
		}),
		(n.useLayoutEffect = function (n, t) {
			var e = c(r++);
			y(e.v, t) && ((e.o = n), (e.v = t), u.__H.u.push(e));
		}),
		(n.useRef = function (n) {
			return v(function () {
				return { current: n };
			}, []);
		}),
		(n.useImperativeHandle = function (n, t, u) {
			var e = c(r++);
			y(e.v, u) && ((e.v = u), n && (n.current = t()));
		}),
		(n.useMemo = v),
		(n.useCallback = function (n, t) {
			return v(function () {
				return n;
			}, t);
		}),
		(n.useContext = function (n) {
			var t = u.context[n.__c];
			if (!t) return n.__p;
			var e = c(r++);
			return null == e.o && ((e.o = !0), t.sub(u)), t.props.value;
		}),
		(n.useDebugValue = function (n, r) {
			t.options.useDebugValue && t.options.useDebugValue(r ? r(n) : n);
		});
});
