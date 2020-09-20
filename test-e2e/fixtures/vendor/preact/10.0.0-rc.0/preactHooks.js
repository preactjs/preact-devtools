import { options as n } from "preact";
var t,
	r,
	u = [],
	i = n.__r;
n.__r = function (n) {
	i && i(n), (t = 0), (r = n.__c).__H && (r.__H.t = w(r.__H.t));
};
var o = n.diffed;
n.diffed = function (n) {
	o && o(n);
	var t = n.__c;
	if (t) {
		var r = t.__H;
		r && (r.u = w(r.u));
	}
};
var f = n.unmount;
function c(t) {
	n.__h && n.__h(r);
	var u = r.__H || (r.__H = { i: [], t: [], u: [] });
	return t >= u.i.length && u.i.push({}), u.i[t];
}
function e(n) {
	return a(q, n);
}
function a(n, u, i) {
	var o = c(t++);
	return (
		o.__c ||
			((o.__c = r),
			(o.o = [
				i ? i(u) : q(null, u),
				function (t) {
					var r = n(o.o[0], t);
					o.o[0] !== r && ((o.o[0] = r), o.__c.setState({}));
				},
			])),
		o.o
	);
}
function v(n, u) {
	var i = c(t++);
	F(i.v, u) && ((i.o = n), (i.v = u), r.__H.t.push(i), _(r));
}
function m(n, u) {
	var i = c(t++);
	F(i.v, u) && ((i.o = n), (i.v = u), r.__H.u.push(i));
}
function p(n) {
	return s(function () {
		return { current: n };
	}, []);
}
function l(n, r, u) {
	var i = c(t++);
	F(i.v, u) && ((i.v = u), n && (n.current = r()));
}
function s(n, r) {
	var u = c(t++);
	return F(u.v, r) ? ((u.v = r), (u.m = n), (u.o = n())) : u.o;
}
function d(n, t) {
	return s(function () {
		return n;
	}, t);
}
function y(n) {
	var u = r.context[n.__c];
	if (!u) return n.__p;
	var i = c(t++);
	return null == i.o && ((i.o = !0), u.sub(r)), u.props.value;
}
function T(t, r) {
	n.useDebugValue && n.useDebugValue(r ? r(t) : t);
}
n.unmount = function (n) {
	f && f(n);
	var t = n.__c;
	if (t) {
		var r = t.__H;
		r &&
			r.i.forEach(function (n) {
				return n.p && n.p();
			});
	}
};
var _ = function () {};
function g() {
	u.some(function (n) {
		(n.l = !1), n.__P && (n.__H.t = w(n.__H.t));
	}),
		(u = []);
}
function w(n) {
	return n.forEach(A), n.forEach(E), [];
}
function A(n) {
	n.p && n.p();
}
function E(n) {
	var t = n.o();
	"function" == typeof t && (n.p = t);
}
function F(n, t) {
	return (
		!n ||
		t.some(function (t, r) {
			return t !== n[r];
		})
	);
}
function q(n, t) {
	return "function" == typeof t ? t(n) : t;
}
"undefined" != typeof window &&
	(_ = function (t) {
		!t.l &&
			(t.l = !0) &&
			1 === u.push(t) &&
			(
				n.requestAnimationFrame ||
				function (n) {
					var t = function () {
							clearTimeout(r), cancelAnimationFrame(u), setTimeout(n);
						},
						r = setTimeout(t, 100),
						u = requestAnimationFrame(t);
				}
			)(g);
	});
export {
	e as useState,
	a as useReducer,
	v as useEffect,
	m as useLayoutEffect,
	p as useRef,
	l as useImperativeHandle,
	s as useMemo,
	d as useCallback,
	y as useContext,
	T as useDebugValue,
};
