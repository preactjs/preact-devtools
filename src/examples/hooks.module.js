import { options as n } from "./preact.module";
var t,
	r,
	u = 1,
	i = 2,
	o = 3,
	f = 4,
	c = 5,
	e = 6,
	a = 7,
	v = 8,
	m = [],
	p = n.__r;
n.__r = function(n) {
	p && p(n), (t = 0), (r = n.__c).__H && (r.__H.__f = k(r.__H.__f));
};
var l = n.diffed;
n.diffed = function(n) {
	l && l(n);
	var t = n.__c;
	if (t) {
		var r = t.__H;
		r && (r.__F = k(r.__F));
	}
};
var s = n.unmount;
function d(t) {
	n.hooked && n.hooked(t);
}
function y(t) {
	n.__h && n.__h(r);
	var u = r.__H || (r.__H = { __l: [], __f: [], __F: [] });
	return t >= u.__l.length && u.__l.push({ t: 0 }), u.__l[t];
}
function _(n) {
	return d(u), T(D, n);
}
function T(n, u, o) {
	d(i);
	var f = y(t++);
	return (
		f.__c ||
			((f.__c = r),
			(f.__V = [
				o ? o(u) : D(null, u),
				function(t) {
					var r = n(f.__V[0], t);
					f.__V[0] !== r && (f.t++, (f.__V[0] = r), f.__c.setState({}));
				},
			])),
		f.__V
	);
}
function g(n, u) {
	d(o);
	var i = y(t++);
	C(i.__a, u) && ((i.__V = n), (i.__a = u), r.__H.__f.push(i), b(r));
}
function w(n, u) {
	d(f);
	var i = y(t++);
	C(i.__a, u) && ((i.__V = n), (i.__a = u), r.__H.__F.push(i));
}
function A(n) {
	return (
		d(c),
		F(function() {
			return { current: n };
		}, [])
	);
}
function E(n, r, u) {
	var i = y(t++);
	C(i.__a, u) && ((i.__a = u), i.t++, n && (n.current = r()));
}
function F(n, r) {
	d(e);
	var u = y(t++);
	return C(u.__a, r) ? ((u.__a = r), u.t++, (u.u = n), (u.__V = n())) : u.__V;
}
function q(n, t) {
	return (
		d(a),
		F(function() {
			return n;
		}, t)
	);
}
function x(n) {
	d(v);
	var u = r.context[n.__c];
	if (!u) return n.__p;
	var i = y(t++);
	return null == i.__V && ((i.__V = n), u.sub(r)), u.props.value;
}
function L(t, r) {
	n.useDebugValue && n.useDebugValue(r ? r(t) : t);
}
n.unmount = function(n) {
	s && s(n);
	var t = n.__c;
	if (t) {
		var r = t.__H;
		r &&
			r.__l.forEach(function(n) {
				return n.i && n.i();
			});
	}
};
var b = function() {};
function h() {
	m.some(function(n) {
		(n.o = !1), n.__P && (n.__H.__f = k(n.__H.__f));
	}),
		(m = []);
}
if ("undefined" != typeof window) {
	var j = n.requestAnimationFrame;
	b = function(t) {
		((!t.o && (t.o = !0) && 1 === m.push(t)) ||
			j !== n.requestAnimationFrame) &&
			((j = n.requestAnimationFrame),
			(n.requestAnimationFrame ||
				function(n) {
					var t = function() {
							clearTimeout(r), cancelAnimationFrame(u), setTimeout(n);
						},
						r = setTimeout(t, 100),
						u = requestAnimationFrame(t);
				})(h));
	};
}
function k(n) {
	return n.forEach(z), n.forEach(B), [];
}
function z(n) {
	n.i && n.i();
}
function B(n) {
	var t = n.__V();
	"function" == typeof t && (n.i = t);
}
function C(n, t) {
	return (
		!n ||
		t.some(function(t, r) {
			return t !== n[r];
		})
	);
}
function D(n, t) {
	return "function" == typeof t ? t(n) : t;
}
export {
	_ as useState,
	T as useReducer,
	g as useEffect,
	w as useLayoutEffect,
	A as useRef,
	E as useImperativeHandle,
	F as useMemo,
	q as useCallback,
	x as useContext,
	L as useDebugValue,
};
//# sourceMappingURL=hooks.module.js.map
