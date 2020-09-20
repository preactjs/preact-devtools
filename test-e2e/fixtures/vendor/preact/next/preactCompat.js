import {
	useState as n,
	useReducer as t,
	useEffect as e,
	useLayoutEffect as r,
	useRef as u,
	useImperativeHandle as o,
	useMemo as i,
	useCallback as c,
	useContext as l,
	useDebugValue as f,
} from "preact/hooks";
export * from "preact/hooks";
import {
	Component as a,
	createElement as s,
	options as h,
	toChildArray as v,
	Fragment as d,
	hydrate as p,
	render as m,
	__u as b,
	cloneElement as y,
	createRef as _,
	createContext as E,
} from "preact";
export {
	createElement,
	createContext,
	createRef,
	Fragment,
	Component,
} from "preact";
function S(n, t) {
	for (var e in t) n[e] = t[e];
	return n;
}
function w(n, t) {
	for (var e in n) if ("__source" !== e && !(e in t)) return !0;
	for (var r in t) if ("__source" !== r && n[r] !== t[r]) return !0;
	return !1;
}
function C(n) {
	this.props = n;
}
function g(n, t) {
	function e(n) {
		var e = this.props.ref,
			r = e == n.ref;
		return (
			!r && e && (e.call ? e(null) : (e.current = null)),
			t ? !t(this.props, n) || !r : w(this.props, n)
		);
	}
	function r(t) {
		return (this.shouldComponentUpdate = e), s(n, t);
	}
	return (
		(r.displayName = "Memo(" + (n.displayName || n.name) + ")"),
		(r.prototype.isReactComponent = !0),
		(r.__f = !0),
		r
	);
}
((C.prototype = new a()).isPureReactComponent = !0),
	(C.prototype.shouldComponentUpdate = function (n, t) {
		return w(this.props, n) || w(this.state, t);
	});
var R = h.__b;
h.__b = function (n) {
	n.type && n.type.__f && n.ref && ((n.props.ref = n.ref), (n.ref = null)),
		R && R(n);
};
var x =
	("undefined" != typeof Symbol &&
		Symbol.for &&
		Symbol.for("react.forward_ref")) ||
	3911;
function N(n) {
	function t(t, e) {
		var r = S({}, t);
		return (
			delete r.ref,
			n(
				r,
				(e = t.ref || e) && ("object" != typeof e || "current" in e) ? e : null,
			)
		);
	}
	return (
		(t.$$typeof = x),
		(t.render = t),
		(t.prototype.isReactComponent = t.__f = !0),
		(t.displayName = "ForwardRef(" + (n.displayName || n.name) + ")"),
		t
	);
}
var k = function (n, t) {
		return null == n ? null : v(v(n).map(t));
	},
	O = {
		map: k,
		forEach: k,
		count: function (n) {
			return n ? v(n).length : 0;
		},
		only: function (n) {
			var t = v(n);
			if (1 !== t.length) throw "Children.only";
			return t[0];
		},
		toArray: v,
	},
	A = h.__e;
function L(n) {
	return n && (((n = S({}, n)).__c = null), (n.__k = n.__k && n.__k.map(L))), n;
}
function U(n) {
	return n && ((n.__v = null), (n.__k = n.__k && n.__k.map(U))), n;
}
function F() {
	(this.__u = 0), (this.t = null), (this.__b = null);
}
function M(n) {
	var t = n.__.__c;
	return t && t.u && t.u(n);
}
function j(n) {
	var t, e, r;
	function u(u) {
		if (
			(t ||
				(t = n()).then(
					function (n) {
						e = n.default || n;
					},
					function (n) {
						r = n;
					},
				),
			r)
		)
			throw r;
		if (!e) throw t;
		return s(e, u);
	}
	return (u.displayName = "Lazy"), (u.__f = !0), u;
}
function D() {
	(this.o = null), (this.i = null);
}
(h.__e = function (n, t, e) {
	if (n.then)
		for (var r, u = t; (u = u.__); )
			if ((r = u.__c) && r.__c)
				return (
					null == t.__e && ((t.__e = e.__e), (t.__k = e.__k)), r.__c(n, t.__c)
				);
	A(n, t, e);
}),
	((F.prototype = new a()).__c = function (n, t) {
		var e = this;
		null == e.t && (e.t = []), e.t.push(t);
		var r = M(e.__v),
			u = !1,
			o = function () {
				u || ((u = !0), (t.componentWillUnmount = t.__c), r ? r(i) : i());
			};
		(t.__c = t.componentWillUnmount),
			(t.componentWillUnmount = function () {
				o(), t.__c && t.__c();
			});
		var i = function () {
				var n;
				if (!--e.__u)
					for (
						e.__v.__k[0] = U(e.state.u), e.setState({ u: (e.__b = null) });
						(n = e.t.pop());

					)
						n.forceUpdate();
			},
			c = e.__v;
		(c && !0 === c.__h) || e.__u++ || e.setState({ u: (e.__b = e.__v.__k[0]) }),
			n.then(o, o);
	}),
	(F.prototype.componentWillUnmount = function () {
		this.t = [];
	}),
	(F.prototype.render = function (n, t) {
		this.__b &&
			(this.__v.__k && (this.__v.__k[0] = L(this.__b)), (this.__b = null));
		var e = t.u && s(d, null, n.fallback);
		return e && (e.__h = null), [s(d, null, t.u ? null : n.children), e];
	});
var I = function (n, t, e) {
	if (
		(++e[1] === e[0] && n.i.delete(t),
		n.props.revealOrder && ("t" !== n.props.revealOrder[0] || !n.i.size))
	)
		for (e = n.o; e; ) {
			for (; e.length > 3; ) e.pop()();
			if (e[1] < e[0]) break;
			n.o = e = e[2];
		}
};
function T(n) {
	return (
		(this.getChildContext = function () {
			return n.context;
		}),
		n.children
	);
}
function W(n) {
	var t = this,
		e = n.l,
		r = s(T, { context: t.context }, n.__v);
	(t.componentWillUnmount = function () {
		var n = t.s.parentNode;
		n && n.removeChild(t.s), b(t.h);
	}),
		t.l && t.l !== e && (t.componentWillUnmount(), (t.v = !1)),
		n.__v
			? t.v
				? ((e.__k = t.__k), m(r, e), (t.__k = e.__k))
				: ((t.s = document.createTextNode("")),
				  (t.__k = e.__k),
				  p("", e),
				  e.appendChild(t.s),
				  (t.v = !0),
				  (t.l = e),
				  m(r, e, t.s),
				  (e.__k = t.__k),
				  (t.__k = t.s.__k))
			: t.v && t.componentWillUnmount(),
		(t.h = r);
}
function P(n, t) {
	return s(W, { __v: n, l: t });
}
((D.prototype = new a()).u = function (n) {
	var t = this,
		e = M(t.__v),
		r = t.i.get(n);
	return (
		r[0]++,
		function (u) {
			var o = function () {
				t.props.revealOrder ? (r.push(u), I(t, n, r)) : u();
			};
			e ? e(o) : o();
		}
	);
}),
	(D.prototype.render = function (n) {
		(this.o = null), (this.i = new Map());
		var t = v(n.children);
		n.revealOrder && "b" === n.revealOrder[0] && t.reverse();
		for (var e = t.length; e--; ) this.i.set(t[e], (this.o = [1, 0, this.o]));
		return n.children;
	}),
	(D.prototype.componentDidUpdate = D.prototype.componentDidMount = function () {
		var n = this;
		this.i.forEach(function (t, e) {
			I(n, e, t);
		});
	});
var z =
		("undefined" != typeof Symbol &&
			Symbol.for &&
			Symbol.for("react.element")) ||
		60103,
	V = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|fill|flood|font|glyph(?!R)|horiz|marker(?!H|W|U)|overline|paint|stop|strikethrough|stroke|text(?!L)|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/,
	B = "undefined" != typeof Symbol ? /fil|che|rad/i : /fil|che|ra/i;
function H(n, t, e) {
	return (
		null == t.__k && (t.textContent = ""),
		m(n, t),
		"function" == typeof e && e(),
		n ? n.__c : null
	);
}
function Z(n, t, e) {
	return p(n, t), "function" == typeof e && e(), n ? n.__c : null;
}
(a.prototype.isReactComponent = {}),
	[
		"componentWillMount",
		"componentWillReceiveProps",
		"componentWillUpdate",
	].forEach(function (n) {
		Object.defineProperty(a.prototype, n, {
			configurable: !0,
			get: function () {
				return this["UNSAFE_" + n];
			},
			set: function (t) {
				Object.defineProperty(this, n, {
					configurable: !0,
					writable: !0,
					value: t,
				});
			},
		});
	});
var Y = h.event;
function $() {}
function q() {
	return this.cancelBubble;
}
function G() {
	return this.defaultPrevented;
}
h.event = function (n) {
	return (
		Y && (n = Y(n)),
		(n.persist = $),
		(n.isPropagationStopped = q),
		(n.isDefaultPrevented = G),
		(n.nativeEvent = n)
	);
};
var J,
	K = {
		configurable: !0,
		get: function () {
			return this.class;
		},
	},
	Q = h.vnode;
h.vnode = function (n) {
	n.$$typeof = z;
	var t = n.type,
		e = n.props;
	if ("function" == typeof t)
		(K.enumerable = "className" in e) && (e.class = e.className),
			Object.defineProperty(e, "className", K);
	else if (t) {
		var r = {};
		for (var u in e) {
			var o = e[u];
			"className" === u && ((r.class = o), (K.enumerable = !0)),
				"defaultValue" === u && "value" in e && null == e.value
					? (u = "value")
					: "download" === u && !0 === o
					? (o = "")
					: /ondoubleclick/i.test(u)
					? (u = "ondblclick")
					: /^onchange(textarea|input)/i.test(u + t) && !B.test(e.type)
					? (u = "oninput")
					: /^on(Ani|Tra|Tou|BeforeInp)/.test(u)
					? (u = u.toLowerCase())
					: V.test(u)
					? (u = u.replace(/[A-Z0-9]/, "-$&").toLowerCase())
					: null === o && (o = void 0),
				(r[u] = o);
		}
		Object.defineProperty(r, "className", K),
			"select" == t &&
				r.multiple &&
				Array.isArray(r.value) &&
				(r.value = v(e.children).forEach(function (n) {
					n.props.selected = -1 != r.value.indexOf(n.props.value);
				})),
			(n.props = r);
	}
	Q && Q(n);
};
var X = h.__r;
h.__r = function (n) {
	X && X(n), (J = n.__c);
};
var nn = {
		ReactCurrentDispatcher: {
			current: {
				readContext: function (n) {
					return J.__n[n.__c].props.value;
				},
			},
		},
	},
	tn = "16.8.0";
function en(n) {
	return s.bind(null, n);
}
function rn(n) {
	return !!n && n.$$typeof === z;
}
function un(n) {
	return rn(n) ? y.apply(null, arguments) : n;
}
function on(n) {
	return !!n.__k && (m(null, n), !0);
}
function cn(n) {
	return (n && (n.base || (1 === n.nodeType && n))) || null;
}
var ln = function (n, t) {
		return n(t);
	},
	fn = d;
export default {
	useState: n,
	useReducer: t,
	useEffect: e,
	useLayoutEffect: r,
	useRef: u,
	useImperativeHandle: o,
	useMemo: i,
	useCallback: c,
	useContext: l,
	useDebugValue: f,
	version: "16.8.0",
	Children: O,
	render: H,
	hydrate: Z,
	unmountComponentAtNode: on,
	createPortal: P,
	createElement: s,
	createContext: E,
	createFactory: en,
	cloneElement: un,
	createRef: _,
	Fragment: d,
	isValidElement: rn,
	findDOMNode: cn,
	Component: a,
	PureComponent: C,
	memo: g,
	forwardRef: N,
	unstable_batchedUpdates: ln,
	StrictMode: d,
	Suspense: F,
	SuspenseList: D,
	lazy: j,
	__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: nn,
};
export {
	tn as version,
	O as Children,
	H as render,
	Z as hydrate,
	on as unmountComponentAtNode,
	P as createPortal,
	en as createFactory,
	un as cloneElement,
	rn as isValidElement,
	cn as findDOMNode,
	C as PureComponent,
	g as memo,
	N as forwardRef,
	ln as unstable_batchedUpdates,
	fn as StrictMode,
	F as Suspense,
	D as SuspenseList,
	j as lazy,
	nn as __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
};
