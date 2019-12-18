import {
	useState as n,
	useReducer as t,
	useEffect as e,
	useLayoutEffect as r,
	useRef as o,
	useImperativeHandle as u,
	useMemo as i,
	useCallback as c,
	useContext as f,
	useDebugValue as a
} from '../../hooks';
export * from '../../hooks';
import {
	Component as l,
	createElement as s,
	_unmount as v,
	options as d,
	cloneElement as p,
	hydrate as h,
	render as m,
	createRef as y,
	h as b,
	toChildArray as g,
	createContext as x,
	Fragment as C
} from '../../';
export { createContext, createRef, Fragment, Component } from '../../';
function E(n, t) {
	for (var e in t) n[e] = t[e];
	return n;
}
function _(n) {
	var t = n.parentNode;
	t && t.removeChild(n);
}
var k = d.__e;
function w(n) {
	(this.__u = []), (this.__f = n.fallback);
}
function A(n) {
	var t, e, r;
	function o(o) {
		if (
			(t ||
				(t = n()).then(
					function(n) {
						e = n.default;
					},
					function(n) {
						r = n;
					}
				),
			r)
		)
			throw r;
		if (!e) throw t;
		return s(e, o);
	}
	return (o.displayName = 'Lazy'), (o.t = !0), o;
}
(d.__e = function(n, t, e) {
	if (n.then && e)
		for (var r, o = t; (o = o.__); )
			if ((r = o.__c) && r.o)
				return e && ((t.__e = e.__e), (t.__k = e.__k)), void r.o(n);
	k(n, t, e);
}),
	((w.prototype = new l()).o = function(n) {
		var t = this;
		t.__u.push(n);
		var e = function() {
			(t.__u[t.__u.indexOf(n)] = t.__u[t.__u.length - 1]),
				t.__u.pop(),
				0 == t.__u.length &&
					(t.__f && v(t.__f),
					(t.__v.__e = null),
					(t.__v.__k = t.state.u),
					t.setState({ u: null }));
		};
		null == t.state.u &&
			((t.__f = t.__f && p(t.__f)),
			t.setState({ u: t.__v.__k }),
			(function n(t) {
				for (var e = 0; e < t.length; e++) {
					var r = t[e];
					null != r &&
						('function' != typeof r.type && r.__e
							? _(r.__e)
							: r.__k && n(r.__k));
				}
			})(t.__v.__k),
			(t.__v.__k = [])),
			n.then(e, e);
	}),
	(w.prototype.render = function(n, t) {
		return t.u ? this.__f : n.children;
	});
var S = '16.8.0',
	F =
		('undefined' != typeof Symbol &&
			Symbol.for &&
			Symbol.for('react.element')) ||
		60103,
	N = /^(?:accent|alignment|arabic|baseline|cap|clip|color|fill|flood|font|glyph|horiz|marker|overline|paint|stop|strikethrough|stroke|text|underline|unicode|units|v|vector|vert|word|writing|x)[A-Z]/,
	R = d.event;
function U(n) {
	return D.bind(null, n);
}
function M(n, t, e) {
	if (null == t.__k) for (; t.firstChild; ) _(t.firstChild);
	return m(n, t), 'function' == typeof e && e(), n ? n.__c : null;
}
d.event = function(n) {
	return R && (n = R(n)), (n.persist = function() {}), (n.nativeEvent = n);
};
var O = (function() {
	function n() {}
	var t = n.prototype;
	return (
		(t.getChildContext = function() {
			return this.props.context;
		}),
		(t.render = function(n) {
			return n.children;
		}),
		n
	);
})();
function j(n) {
	var t = this,
		e = n.container,
		r = b(O, { context: t.context }, n.vnode);
	return (
		t.i &&
			t.i !== e &&
			(t.l.parentNode && t.i.removeChild(t.l), v(t.s), (t.v = !1)),
		n.vnode
			? t.v
				? ((e.__k = t.__k), m(r, e), (t.__k = e.__k))
				: ((t.l = document.createTextNode('')),
				  h('', e),
				  e.appendChild(t.l),
				  (t.v = !0),
				  (t.i = e),
				  m(r, e, t.l),
				  (t.__k = this.l.__k))
			: t.v && (t.l.parentNode && t.i.removeChild(t.l), v(t.s)),
		(t.s = r),
		(t.componentWillUnmount = function() {
			t.l.parentNode && t.i.removeChild(t.l), v(t.s);
		}),
		null
	);
}
function z(n, t) {
	return b(j, { vnode: n, container: t });
}
var P = function(n, t) {
		return n ? g(n).map(t) : null;
	},
	W = {
		map: P,
		forEach: P,
		count: function(n) {
			return n ? g(n).length : 0;
		},
		only: function(n) {
			if (1 !== (n = g(n)).length)
				throw new Error('Children.only() expects only one child.');
			return n[0];
		},
		toArray: g
	};
function D() {
	var n = b.apply(void 0, arguments),
		t = n.type,
		e = n.props;
	return (
		'function' != typeof t &&
			(e.defaultValue &&
				(e.value || 0 === e.value || (e.value = e.defaultValue),
				delete e.defaultValue),
			Array.isArray(e.value) &&
				e.multiple &&
				'select' === t &&
				(g(e.children).forEach(function(n) {
					-1 != e.value.indexOf(n.props.value) && (n.props.selected = !0);
				}),
				delete e.value),
			(function(n, t) {
				var e, r, o;
				for (o in t) if ((e = N.test(o))) break;
				if (e)
					for (o in ((r = n.props = {}), t))
						r[N.test(o) ? o.replace(/([A-Z0-9])/, '-$1').toLowerCase() : o] =
							t[o];
			})(n, e)),
		(n.preactCompatNormalized = !1),
		L(n)
	);
}
function L(n) {
	return (
		(n.preactCompatNormalized = !0),
		(function(n) {
			var t = n.props;
			(t.class || t.className) &&
				((I.enumerable = 'className' in t),
				t.className && (t.class = t.className),
				Object.defineProperty(t, 'className', I));
		})(n),
		n
	);
}
function V(n) {
	return Z(n) ? L(p.apply(null, arguments)) : n;
}
function Z(n) {
	return !!n && n.$$typeof === F;
}
function H(n) {
	return !!n.__k && (m(null, n), !0);
}
var I = {
	configurable: !0,
	get: function() {
		return this.class;
	}
};
function T(n, t) {
	for (var e in n) if ('__source' !== e && !(e in t)) return !0;
	for (var r in t) if ('__source' !== r && n[r] !== t[r]) return !0;
	return !1;
}
function $(n) {
	return (n && (n.base || (1 === n.nodeType && n))) || null;
}
var q = (function(n) {
	var t, e;
	function r(t) {
		var e;
		return ((e = n.call(this, t) || this).isPureReactComponent = !0), e;
	}
	return (
		(e = n),
		((t = r).prototype = Object.create(e.prototype)),
		(t.prototype.constructor = t),
		(t.__proto__ = e),
		(r.prototype.shouldComponentUpdate = function(n, t) {
			return T(this.props, n) || T(this.state, t);
		}),
		r
	);
})(l);
function B(n, t) {
	function e(n) {
		var e = this.props.ref,
			r = e == n.ref;
		return (
			!r && e && (e.call ? e(null) : (e.current = null)),
			t ? !t(this.props, n) || !r : T(this.props, n)
		);
	}
	function r(t) {
		return (this.shouldComponentUpdate = e), b(n, E({}, t));
	}
	return (
		(r.prototype.isReactComponent = !0),
		(r.displayName = 'Memo(' + (n.displayName || n.name) + ')'),
		(r.t = !0),
		r
	);
}
function G(n) {
	function t(t) {
		var e = E({}, t);
		return delete e.ref, n(e, t.ref);
	}
	return (
		(t.prototype.isReactComponent = !0),
		(t.t = !0),
		(t.displayName = 'ForwardRef(' + (n.displayName || n.name) + ')'),
		t
	);
}
function J(n, t) {
	n['UNSAFE_' + t] &&
		!n[t] &&
		Object.defineProperty(n, t, {
			configurable: !1,
			get: function() {
				return this['UNSAFE_' + t];
			},
			set: function(n) {
				this['UNSAFE_' + t] = n;
			}
		});
}
l.prototype.isReactComponent = {};
var K = d.vnode;
d.vnode = function(n) {
	(n.$$typeof = F),
		(function(t) {
			var e = n.type,
				r = n.props;
			if (r && 'string' == typeof e) {
				var o = {};
				for (var u in r)
					/^on(Ani|Tra)/.test(u) && ((r[u.toLowerCase()] = r[u]), delete r[u]),
						(o[u.toLowerCase()] = u);
				if (
					(o.ondoubleclick &&
						((r.ondblclick = r[o.ondoubleclick]), delete r[o.ondoubleclick]),
					o.onbeforeinput &&
						((r.onbeforeinput = r[o.onbeforeinput]), delete r[o.onbeforeinput]),
					o.onchange &&
						('textarea' === e ||
							('input' === e.toLowerCase() && !/^fil|che|ra/i.test(r.type))))
				) {
					var i = o.oninput || 'oninput';
					r[i] || ((r[i] = r[o.onchange]), delete r[o.onchange]);
				}
			}
		})();
	var t = n.type;
	t && t.t && n.ref && ((n.props.ref = n.ref), (n.ref = null)),
		'function' == typeof t &&
			!t.p &&
			t.prototype &&
			(J(t.prototype, 'componentWillMount'),
			J(t.prototype, 'componentWillReceiveProps'),
			J(t.prototype, 'componentWillUpdate'),
			(t.p = !0)),
		K && K(n);
};
var Q = function(n, t) {
	return n(t);
};
export default {
	useState: n,
	useReducer: t,
	useEffect: e,
	useLayoutEffect: r,
	useRef: o,
	useImperativeHandle: u,
	useMemo: i,
	useCallback: c,
	useContext: f,
	useDebugValue: a,
	version: '16.8.0',
	Children: W,
	render: M,
	hydrate: M,
	unmountComponentAtNode: H,
	createPortal: z,
	createElement: D,
	createContext: x,
	createFactory: U,
	cloneElement: V,
	createRef: y,
	Fragment: C,
	isValidElement: Z,
	findDOMNode: $,
	Component: l,
	PureComponent: q,
	memo: B,
	forwardRef: G,
	unstable_batchedUpdates: Q,
	Suspense: w,
	lazy: A
};
export {
	S as version,
	W as Children,
	M as render,
	M as hydrate,
	H as unmountComponentAtNode,
	z as createPortal,
	D as createElement,
	U as createFactory,
	V as cloneElement,
	Z as isValidElement,
	$ as findDOMNode,
	q as PureComponent,
	B as memo,
	G as forwardRef,
	Q as unstable_batchedUpdates,
	w as Suspense,
	A as lazy
};
//# sourceMappingURL=compat.module.js.map
