!(function(n, t) {
	'object' == typeof exports && 'undefined' != typeof module
		? t(exports, require('preact/hooks'), require('preact'))
		: 'function' == typeof define && define.amd
		? define(['exports', 'preact/hooks', 'preact'], t)
		: t((n.preactCompat = {}), n.preactHooks, n.preact);
})(this, function(n, t, e) {
	function r(n, t) {
		for (var e in t) n[e] = t[e];
		return n;
	}
	function o(n) {
		var t = n.parentNode;
		t && t.removeChild(n);
	}
	var u = e.options.__e;
	function i(n) {
		(this.__u = []), (this.__f = n.fallback);
	}
	function f(n) {
		var t, r, o;
		function u(u) {
			if (
				(t ||
					(t = n()).then(
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
			if (!r) throw t;
			return e.createElement(r, u);
		}
		return (u.displayName = 'Lazy'), (u.t = !0), u;
	}
	(e.options.__e = function(n, t, e) {
		if (n.then && e)
			for (var r, o = t; (o = o.__); )
				if ((r = o.__c) && r.o)
					return e && ((t.__e = e.__e), (t.__k = e.__k)), void r.o(n);
		u(n, t, e);
	}),
		((i.prototype = new e.Component()).o = function(n) {
			var t = this;
			t.__u.push(n);
			var r = function() {
				(t.__u[t.__u.indexOf(n)] = t.__u[t.__u.length - 1]),
					t.__u.pop(),
					0 == t.__u.length &&
						(t.__f && e._e(t.__f),
						(t.__v.__e = null),
						(t.__v.__k = t.state.u),
						t.setState({ u: null }));
			};
			null == t.state.u &&
				((t.__f = t.__f && e.cloneElement(t.__f)),
				t.setState({ u: t.__v.__k }),
				(function n(t) {
					for (var e = 0; e < t.length; e++) {
						var r = t[e];
						null != r &&
							('function' != typeof r.type && r.__e
								? o(r.__e)
								: r.__k && n(r.__k));
					}
				})(t.__v.__k),
				(t.__v.__k = [])),
				n.then(r, r);
		}),
		(i.prototype.render = function(n, t) {
			return t.u ? this.__f : n.children;
		});
	var c =
			('undefined' != typeof Symbol &&
				Symbol.for &&
				Symbol.for('react.element')) ||
			60103,
		a = /^(?:accent|alignment|arabic|baseline|cap|clip|color|fill|flood|font|glyph|horiz|marker|overline|paint|stop|strikethrough|stroke|text|underline|unicode|units|v|vector|vert|word|writing|x)[A-Z]/,
		l = e.options.event;
	function s(n) {
		return b.bind(null, n);
	}
	function d(n, t, r) {
		if (null == t.__k) for (; t.firstChild; ) o(t.firstChild);
		return e.render(n, t), 'function' == typeof r && r(), n ? n.__c : null;
	}
	e.options.event = function(n) {
		return l && (n = l(n)), (n.persist = function() {}), (n.nativeEvent = n);
	};
	var v = (function() {
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
	function p(n) {
		var t = this,
			r = n.container,
			o = e.h(v, { context: t.context }, n.vnode);
		return (
			t.i &&
				t.i !== r &&
				(t.l.parentNode && t.i.removeChild(t.l), e._e(t.s), (t.v = !1)),
			n.vnode
				? t.v
					? ((r.__k = t.__k), e.render(o, r), (t.__k = r.__k))
					: ((t.l = document.createTextNode('')),
					  e.hydrate('', r),
					  r.appendChild(t.l),
					  (t.v = !0),
					  (t.i = r),
					  e.render(o, r, t.l),
					  (t.__k = this.l.__k))
				: t.v && (t.l.parentNode && t.i.removeChild(t.l), e._e(t.s)),
			(t.s = o),
			(t.componentWillUnmount = function() {
				t.l.parentNode && t.i.removeChild(t.l), e._e(t.s);
			}),
			null
		);
	}
	function h(n, t) {
		return e.h(p, { vnode: n, container: t });
	}
	var m = function(n, t) {
			return n ? e.toChildArray(n).map(t) : null;
		},
		y = {
			map: m,
			forEach: m,
			count: function(n) {
				return n ? e.toChildArray(n).length : 0;
			},
			only: function(n) {
				if (1 !== (n = e.toChildArray(n)).length)
					throw new Error('Children.only() expects only one child.');
				return n[0];
			},
			toArray: e.toChildArray
		};
	function b() {
		var n = e.h.apply(void 0, arguments),
			t = n.type,
			r = n.props;
		return (
			'function' != typeof t &&
				(r.defaultValue &&
					(r.value || 0 === r.value || (r.value = r.defaultValue),
					delete r.defaultValue),
				Array.isArray(r.value) &&
					r.multiple &&
					'select' === t &&
					(e.toChildArray(r.children).forEach(function(n) {
						-1 != r.value.indexOf(n.props.value) && (n.props.selected = !0);
					}),
					delete r.value),
				(function(n, t) {
					var e, r, o;
					for (o in t) if ((e = a.test(o))) break;
					if (e)
						for (o in ((r = n.props = {}), t))
							r[a.test(o) ? o.replace(/([A-Z0-9])/, '-$1').toLowerCase() : o] =
								t[o];
				})(n, r)),
			(n.preactCompatNormalized = !1),
			g(n)
		);
	}
	function g(n) {
		return (
			(n.preactCompatNormalized = !0),
			(function(n) {
				var t = n.props;
				(t.class || t.className) &&
					((_.enumerable = 'className' in t),
					t.className && (t.class = t.className),
					Object.defineProperty(t, 'className', _));
			})(n),
			n
		);
	}
	function x(n) {
		return C(n) ? g(e.cloneElement.apply(null, arguments)) : n;
	}
	function C(n) {
		return !!n && n.$$typeof === c;
	}
	function E(n) {
		return !!n.__k && (e.render(null, n), !0);
	}
	var _ = {
		configurable: !0,
		get: function() {
			return this.class;
		}
	};
	function k(n, t) {
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
				return k(this.props, n) || k(this.state, t);
			}),
			r
		);
	})(e.Component);
	function S(n, t) {
		function o(n) {
			var e = this.props.ref,
				r = e == n.ref;
			return (
				!r && e && (e.call ? e(null) : (e.current = null)),
				t ? !t(this.props, n) || !r : k(this.props, n)
			);
		}
		function u(t) {
			return (this.shouldComponentUpdate = o), e.h(n, r({}, t));
		}
		return (
			(u.prototype.isReactComponent = !0),
			(u.displayName = 'Memo(' + (n.displayName || n.name) + ')'),
			(u.t = !0),
			u
		);
	}
	function N(n) {
		function t(t) {
			var e = r({}, t);
			return delete e.ref, n(e, t.ref);
		}
		return (
			(t.prototype.isReactComponent = !0),
			(t.t = !0),
			(t.displayName = 'ForwardRef(' + (n.displayName || n.name) + ')'),
			t
		);
	}
	function F(n, t) {
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
	e.Component.prototype.isReactComponent = {};
	var R = e.options.vnode;
	e.options.vnode = function(n) {
		(n.$$typeof = c),
			(function(t) {
				var e = n.type,
					r = n.props;
				if (r && 'string' == typeof e) {
					var o = {};
					for (var u in r)
						/^on(Ani|Tra)/.test(u) &&
							((r[u.toLowerCase()] = r[u]), delete r[u]),
							(o[u.toLowerCase()] = u);
					if (
						(o.ondoubleclick &&
							((r.ondblclick = r[o.ondoubleclick]), delete r[o.ondoubleclick]),
						o.onbeforeinput &&
							((r.onbeforeinput = r[o.onbeforeinput]),
							delete r[o.onbeforeinput]),
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
				(F(t.prototype, 'componentWillMount'),
				F(t.prototype, 'componentWillReceiveProps'),
				F(t.prototype, 'componentWillUpdate'),
				(t.p = !0)),
			R && R(n);
	};
	var j = function(n, t) {
			return n(t);
		},
		O = {
			useState: t.useState,
			useReducer: t.useReducer,
			useEffect: t.useEffect,
			useLayoutEffect: t.useLayoutEffect,
			useRef: t.useRef,
			useImperativeHandle: t.useImperativeHandle,
			useMemo: t.useMemo,
			useCallback: t.useCallback,
			useContext: t.useContext,
			useDebugValue: t.useDebugValue,
			version: '16.8.0',
			Children: y,
			render: d,
			hydrate: d,
			unmountComponentAtNode: E,
			createPortal: h,
			createElement: b,
			createContext: e.createContext,
			createFactory: s,
			cloneElement: x,
			createRef: e.createRef,
			Fragment: e.Fragment,
			isValidElement: C,
			findDOMNode: w,
			Component: e.Component,
			PureComponent: A,
			memo: S,
			forwardRef: N,
			unstable_batchedUpdates: j,
			Suspense: i,
			lazy: f
		};
	Object.keys(t).forEach(function(e) {
		n[e] = t[e];
	}),
		(n.createContext = e.createContext),
		(n.createRef = e.createRef),
		(n.Fragment = e.Fragment),
		(n.Component = e.Component),
		(n.version = '16.8.0'),
		(n.Children = y),
		(n.render = d),
		(n.hydrate = d),
		(n.unmountComponentAtNode = E),
		(n.createPortal = h),
		(n.createElement = b),
		(n.createFactory = s),
		(n.cloneElement = x),
		(n.isValidElement = C),
		(n.findDOMNode = w),
		(n.PureComponent = A),
		(n.memo = S),
		(n.forwardRef = N),
		(n.unstable_batchedUpdates = j),
		(n.Suspense = i),
		(n.lazy = f),
		(n.default = O);
});
//# sourceMappingURL=compat.umd.js.map
