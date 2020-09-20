import * as n from "preact/hooks";
export * from "preact/hooks";
import {
	Component as t,
	createElement as r,
	_unmount as e,
	options as o,
	hydrate as i,
	render as u,
	cloneElement as c,
	createRef as f,
	h as a,
	toChildArray as l,
	createContext as s,
	Fragment as v,
} from "preact";
export { createContext, createRef, Fragment, Component } from "preact";
function d(n, t) {
	for (var r in t) n[r] = t[r];
	return n;
}
function p(n) {
	var t = n.parentNode;
	t && t.removeChild(n);
}
var h = o.__e;
function m() {
	this.t = [];
}
function y(n) {
	var t, e, o;
	function i(i) {
		if (
			(t ||
				(t = n()).then(
					function (n) {
						e = n.default;
					},
					function (n) {
						o = n;
					},
				),
			o)
		)
			throw o;
		if (!e) throw t;
		return r(e, i);
	}
	return (i.displayName = "Lazy"), i;
}
(o.__e = function (n, t, r) {
	if (n.then && r)
		for (var e, o = t; (o = o.__p); )
			if ((e = o.__c) && e.o)
				return r && ((t.__e = r.__e), (t.__k = r.__k)), void e.o(n);
	h(n, t, r);
}),
	((m.prototype = new t()).o = function (n) {
		var t = this;
		t.t.push(n);
		var r = function () {
			(t.t[t.t.indexOf(n)] = t.t[t.t.length - 1]),
				t.t.pop(),
				0 == t.t.length &&
					(e(t.props.fallback),
					(t.__v.__e = null),
					(t.__v.__k = t.state.i),
					t.setState({ i: null }));
		};
		null == t.state.i &&
			(t.setState({ i: t.__v.__k }),
			(function n(t) {
				for (var r = 0; r < t.length; r++) {
					var e = t[r];
					null != e &&
						("function" != typeof e.type && e.__e
							? p(e.__e)
							: e.__k && n(e.__k));
				}
			})(t.__v.__k),
			(t.__v.__k = [])),
			n.then(r, r);
	}),
	(m.prototype.render = function (n, t) {
		return t.i ? n.fallback : n.children;
	});
var b = "16.8.0",
	g =
		("undefined" != typeof Symbol &&
			Symbol.for &&
			Symbol.for("react.element")) ||
		60103,
	x = /^(?:accent|alignment|arabic|baseline|cap|clip|color|fill|flood|font|glyph|horiz|marker|overline|paint|stop|strikethrough|stroke|text|underline|unicode|units|v|vector|vert|word|writing|x)[A-Z]/,
	C = o.event;
function w(n) {
	return S.bind(null, n);
}
function k(n, t, r) {
	for (; t.firstChild; ) p(t.firstChild);
	return u(n, t), "function" == typeof r && r(), n ? n.__c : null;
}
o.event = function (n) {
	return C && (n = C(n)), (n.persist = function () {}), (n.nativeEvent = n);
};
var E = function () {};
function A(n) {
	var t = this,
		r = n.container,
		o = a(E, { context: t.context }, n.vnode);
	return (
		t.u &&
			t.u !== r &&
			(t.l.parentNode && t.u.removeChild(t.l), e(t.s), (t.v = !1)),
		n.vnode
			? t.v
				? k(o, r)
				: ((t.l = document.createTextNode("")),
				  i("", r),
				  r.insertBefore(t.l, r.firstChild),
				  (t.v = !0),
				  (t.u = r),
				  u(o, r, t.l))
			: t.v && (t.l.parentNode && t.u.removeChild(t.l), e(t.s)),
		(t.s = o),
		(t.componentWillUnmount = function () {
			t.l.parentNode && t.u.removeChild(t.l), e(t.s);
		}),
		null
	);
}
function F(n, t) {
	return a(A, { vnode: n, container: t });
}
(E.prototype.getChildContext = function () {
	return this.props.context;
}),
	(E.prototype.render = function (n) {
		return n.children;
	});
var N = function (n, t) {
		return n ? l(n).map(t) : null;
	},
	R = {
		map: N,
		forEach: N,
		count: function (n) {
			return n ? l(n).length : 0;
		},
		only: function (n) {
			if (1 !== (n = l(n)).length)
				throw new Error("Children.only() expects only one child.");
			return n[0];
		},
		toArray: l,
	};
function S() {
	for (var n = [], t = arguments.length; t--; ) n[t] = arguments[t];
	var r = a.apply(void 0, n),
		e = r.type,
		o = r.props;
	return (
		"function" != typeof e &&
			(o.defaultValue &&
				(o.value || 0 === o.value || (o.value = o.defaultValue),
				delete o.defaultValue),
			Array.isArray(o.value) &&
				o.multiple &&
				"select" === e &&
				(l(o.children).forEach(function (n) {
					-1 != o.value.indexOf(n.props.value) && (n.props.selected = !0);
				}),
				delete o.value),
			(function (n, t) {
				var r, e, o;
				for (o in t) if ((r = x.test(o))) break;
				if (r)
					for (o in ((e = n.props = {}), t))
						e[x.test(o) ? o.replace(/([A-Z0-9])/, "-$1").toLowerCase() : o] =
							t[o];
			})(r, o)),
		(r.preactCompatNormalized = !1),
		O(r)
	);
}
function O(n) {
	return (
		(n.preactCompatNormalized = !0),
		(function (n) {
			var t = n.props;
			(t.class || t.className) &&
				((M.enumerable = "className" in t),
				t.className && (t.class = t.className),
				Object.defineProperty(t, "className", M));
		})(n),
		n
	);
}
function _(n) {
	return j(n) ? O(c.apply(null, arguments)) : n;
}
function j(n) {
	return !!n && n.$$typeof === g;
}
function z(n) {
	return !!n.__k && (u(null, n), !0);
}
var M = {
	configurable: !0,
	get: function () {
		return this.class;
	},
};
function P(n, t) {
	for (var r in n) if (!(r in t)) return !0;
	for (var e in t) if (n[e] !== t[e]) return !0;
	return !1;
}
function U(n) {
	return (n && (n.base || (1 === n.nodeType && n))) || null;
}
var W = (function (n) {
	function t(t) {
		n.call(this, t), (this.isPureReactComponent = !0);
	}
	return (
		n && (t.__proto__ = n),
		((t.prototype = Object.create(n && n.prototype)).constructor = t),
		(t.prototype.shouldComponentUpdate = function (n, t) {
			return P(this.props, n) || P(this.state, t);
		}),
		t
	);
})(t);
function Z(n, t) {
	function r(n) {
		var r = this.props.ref,
			e = r == n.ref;
		return (
			e || (r.call ? r(null) : (r.current = null)),
			(t ? !t(this.props, n) : P(this.props, n)) || !e
		);
	}
	function e(t) {
		return (this.shouldComponentUpdate = r), a(n, d({}, t));
	}
	return (
		(e.displayName = "Memo(" + (n.displayName || n.name) + ")"), (e.p = !0), e
	);
}
function D(n, t) {
	Object.defineProperty(n.prototype, "UNSAFE_" + t, {
		configurable: !0,
		get: function () {
			return this[t];
		},
		set: function (n) {
			this[t] = n;
		},
	});
}
function L(n) {
	function t(t) {
		var r = t.ref;
		return delete t.ref, n(t, r);
	}
	return (
		(t.p = !0),
		(t.displayName = "ForwardRef(" + (n.displayName || n.name) + ")"),
		t
	);
}
(t.prototype.isReactComponent = {}),
	D(t, "componentWillMount"),
	D(t, "componentWillReceiveProps"),
	D(t, "componentWillUpdate");
var V = o.vnode;
o.vnode = function (n) {
	(n.$$typeof = g),
		(function (t) {
			var r = n.type,
				e = n.props;
			if (e && "string" == typeof r) {
				var o = {};
				for (var i in e) o[i.toLowerCase()] = i;
				if (
					(o.ondoubleclick &&
						((e.ondblclick = e[o.ondoubleclick]), delete e[o.ondoubleclick]),
					o.onbeforeinput &&
						((e.onbeforeinput = e[o.onbeforeinput]), delete e[o.onbeforeinput]),
					o.onchange &&
						("textarea" === r ||
							("input" === r.toLowerCase() && !/^fil|che|rad/i.test(e.type))))
				) {
					var u = o.oninput || "oninput";
					e[u] || ((e[u] = e[o.onchange]), delete e[o.onchange]);
				}
			}
		})();
	var t = n.type;
	t && t.p && n.ref && ((n.props.ref = n.ref), (n.ref = null)), V && V(n);
};
var $ = function (n, t) {
	return n(t);
};
export default d(
	{
		version: "16.8.0",
		Children: R,
		render: k,
		hydrate: k,
		unmountComponentAtNode: z,
		createPortal: F,
		createElement: S,
		createContext: s,
		createFactory: w,
		cloneElement: _,
		createRef: f,
		Fragment: v,
		isValidElement: j,
		findDOMNode: U,
		Component: t,
		PureComponent: W,
		memo: Z,
		forwardRef: L,
		unstable_batchedUpdates: $,
		Suspense: m,
		lazy: y,
	},
	n,
);
export {
	b as version,
	R as Children,
	k as render,
	k as hydrate,
	z as unmountComponentAtNode,
	F as createPortal,
	S as createElement,
	w as createFactory,
	_ as cloneElement,
	j as isValidElement,
	U as findDOMNode,
	W as PureComponent,
	Z as memo,
	L as forwardRef,
	$ as unstable_batchedUpdates,
	m as Suspense,
	y as lazy,
};
