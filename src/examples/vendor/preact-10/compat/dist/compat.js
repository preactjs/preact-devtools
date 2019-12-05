var n = require('preact/hooks'),
	t = require('preact');
function e(n, t) {
	for (var e in t) n[e] = t[e];
	return n;
}
function r(n) {
	var t = n.parentNode;
	t && t.removeChild(n);
}
var o = t.options.__e;
function u(n) {
	(this.__u = []), (this.__f = n.fallback);
}
function i(n) {
	var e, r, o;
	function u(u) {
		if (
			(e ||
				(e = n()).then(
					function(n) {
						r = n.default;
					},
					function(n) {
						o = n;
					}
				),
			o)
		)
			throw o;
		if (!r) throw e;
		return t.createElement(r, u);
	}
	return (u.displayName = 'Lazy'), (u.t = !0), u;
}
(t.options.__e = function(n, t, e) {
	if (n.then && e)
		for (var r, u = t; (u = u.__); )
			if ((r = u.__c) && r.o)
				return e && ((t.__e = e.__e), (t.__k = e.__k)), void r.o(n);
	o(n, t, e);
}),
	((u.prototype = new t.Component()).o = function(n) {
		var e = this;
		e.__u.push(n);
		var o = function() {
			(e.__u[e.__u.indexOf(n)] = e.__u[e.__u.length - 1]),
				e.__u.pop(),
				0 == e.__u.length &&
					(e.__f && t._e(e.__f),
					(e.__v.__e = null),
					(e.__v.__k = e.state.u),
					e.setState({ u: null }));
		};
		null == e.state.u &&
			((e.__f = e.__f && t.cloneElement(e.__f)),
			e.setState({ u: e.__v.__k }),
			(function n(t) {
				for (var e = 0; e < t.length; e++) {
					var o = t[e];
					null != o &&
						('function' != typeof o.type && o.__e
							? r(o.__e)
							: o.__k && n(o.__k));
				}
			})(e.__v.__k),
			(e.__v.__k = [])),
			n.then(o, o);
	}),
	(u.prototype.render = function(n, t) {
		return t.u ? this.__f : n.children;
	});
var c =
		('undefined' != typeof Symbol &&
			Symbol.for &&
			Symbol.for('react.element')) ||
		60103,
	f = /^(?:accent|alignment|arabic|baseline|cap|clip|color|fill|flood|font|glyph|horiz|marker|overline|paint|stop|strikethrough|stroke|text|underline|unicode|units|v|vector|vert|word|writing|x)[A-Z]/,
	a = t.options.event;
function l(n) {
	return m.bind(null, n);
}
function s(n, e, o) {
	if (null == e.__k) for (; e.firstChild; ) r(e.firstChild);
	return t.render(n, e), 'function' == typeof o && o(), n ? n.__c : null;
}
t.options.event = function(n) {
	return a && (n = a(n)), (n.persist = function() {}), (n.nativeEvent = n);
};
var p = (function() {
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
function v(n) {
	var e = this,
		r = n.container,
		o = t.h(p, { context: e.context }, n.vnode);
	return (
		e.i &&
			e.i !== r &&
			(e.l.parentNode && e.i.removeChild(e.l), t._e(e.s), (e.p = !1)),
		n.vnode
			? e.p
				? ((r.__k = e.__k), t.render(o, r), (e.__k = r.__k))
				: ((e.l = document.createTextNode('')),
				  t.hydrate('', r),
				  r.appendChild(e.l),
				  (e.p = !0),
				  (e.i = r),
				  t.render(o, r, e.l),
				  (e.__k = this.l.__k))
			: e.p && (e.l.parentNode && e.i.removeChild(e.l), t._e(e.s)),
		(e.s = o),
		(e.componentWillUnmount = function() {
			e.l.parentNode && e.i.removeChild(e.l), t._e(e.s);
		}),
		null
	);
}
function d(n, e) {
	return t.h(v, { vnode: n, container: e });
}
var h = function(n, e) {
		return n ? t.toChildArray(n).map(e) : null;
	},
	x = {
		map: h,
		forEach: h,
		count: function(n) {
			return n ? t.toChildArray(n).length : 0;
		},
		only: function(n) {
			if (1 !== (n = t.toChildArray(n)).length)
				throw new Error('Children.only() expects only one child.');
			return n[0];
		},
		toArray: t.toChildArray
	};
function m() {
	var n = t.h.apply(void 0, arguments),
		e = n.type,
		r = n.props;
	return (
		'function' != typeof e &&
			(r.defaultValue &&
				(r.value || 0 === r.value || (r.value = r.defaultValue),
				delete r.defaultValue),
			Array.isArray(r.value) &&
				r.multiple &&
				'select' === e &&
				(t.toChildArray(r.children).forEach(function(n) {
					-1 != r.value.indexOf(n.props.value) && (n.props.selected = !0);
				}),
				delete r.value),
			(function(n, t) {
				var e, r, o;
				for (o in t) if ((e = f.test(o))) break;
				if (e)
					for (o in ((r = n.props = {}), t))
						r[f.test(o) ? o.replace(/([A-Z0-9])/, '-$1').toLowerCase() : o] =
							t[o];
			})(n, r)),
		(n.preactCompatNormalized = !1),
		y(n)
	);
}
function y(n) {
	return (
		(n.preactCompatNormalized = !0),
		(function(n) {
			var t = n.props;
			(t.class || t.className) &&
				((E.enumerable = 'className' in t),
				t.className && (t.class = t.className),
				Object.defineProperty(t, 'className', E));
		})(n),
		n
	);
}
function b(n) {
	return g(n) ? y(t.cloneElement.apply(null, arguments)) : n;
}
function g(n) {
	return !!n && n.$$typeof === c;
}
function C(n) {
	return !!n.__k && (t.render(null, n), !0);
}
var E = {
	configurable: !0,
	get: function() {
		return this.class;
	}
};
function _(n, t) {
	for (var e in n) if ('__source' !== e && !(e in t)) return !0;
	for (var r in t) if ('__source' !== r && n[r] !== t[r]) return !0;
	return !1;
}
function w(n) {
	return (n && (n.base || (1 === n.nodeType && n))) || null;
}
var A = (function(n) {
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
			return _(this.props, n) || _(this.state, t);
		}),
		r
	);
})(t.Component);
function k(n, r) {
	function o(n) {
		var t = this.props.ref,
			e = t == n.ref;
		return (
			!e && t && (t.call ? t(null) : (t.current = null)),
			r ? !r(this.props, n) || !e : _(this.props, n)
		);
	}
	function u(r) {
		return (this.shouldComponentUpdate = o), t.h(n, e({}, r));
	}
	return (
		(u.prototype.isReactComponent = !0),
		(u.displayName = 'Memo(' + (n.displayName || n.name) + ')'),
		(u.t = !0),
		u
	);
}
function S(n) {
	function t(t) {
		var r = e({}, t);
		return delete r.ref, n(r, t.ref);
	}
	return (
		(t.prototype.isReactComponent = !0),
		(t.t = !0),
		(t.displayName = 'ForwardRef(' + (n.displayName || n.name) + ')'),
		t
	);
}
function N(n, t) {
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
t.Component.prototype.isReactComponent = {};
var F = t.options.vnode;
t.options.vnode = function(n) {
	(n.$$typeof = c),
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
			!t.v &&
			t.prototype &&
			(N(t.prototype, 'componentWillMount'),
			N(t.prototype, 'componentWillReceiveProps'),
			N(t.prototype, 'componentWillUpdate'),
			(t.v = !0)),
		F && F(n);
};
var R = function(n, t) {
		return n(t);
	},
	O = {
		useState: n.useState,
		useReducer: n.useReducer,
		useEffect: n.useEffect,
		useLayoutEffect: n.useLayoutEffect,
		useRef: n.useRef,
		useImperativeHandle: n.useImperativeHandle,
		useMemo: n.useMemo,
		useCallback: n.useCallback,
		useContext: n.useContext,
		useDebugValue: n.useDebugValue,
		version: '16.8.0',
		Children: x,
		render: s,
		hydrate: s,
		unmountComponentAtNode: C,
		createPortal: d,
		createElement: m,
		createContext: t.createContext,
		createFactory: l,
		cloneElement: b,
		createRef: t.createRef,
		Fragment: t.Fragment,
		isValidElement: g,
		findDOMNode: w,
		Component: t.Component,
		PureComponent: A,
		memo: k,
		forwardRef: S,
		unstable_batchedUpdates: R,
		Suspense: u,
		lazy: i
	};
Object.keys(n).forEach(function(t) {
	exports[t] = n[t];
}),
	(exports.createContext = t.createContext),
	(exports.createRef = t.createRef),
	(exports.Fragment = t.Fragment),
	(exports.Component = t.Component),
	(exports.version = '16.8.0'),
	(exports.Children = x),
	(exports.render = s),
	(exports.hydrate = s),
	(exports.unmountComponentAtNode = C),
	(exports.createPortal = d),
	(exports.createElement = m),
	(exports.createFactory = l),
	(exports.cloneElement = b),
	(exports.isValidElement = g),
	(exports.findDOMNode = w),
	(exports.PureComponent = A),
	(exports.memo = k),
	(exports.forwardRef = S),
	(exports.unstable_batchedUpdates = R),
	(exports.Suspense = u),
	(exports.lazy = i),
	(exports.default = O);
//# sourceMappingURL=compat.js.map
