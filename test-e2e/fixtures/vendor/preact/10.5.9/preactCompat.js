!(function (n, t) {
	"object" == typeof exports && "undefined" != typeof module
		? t(exports, require("preact/hooks"), require("preact"))
		: "function" == typeof define && define.amd
		? define(["exports", "preact/hooks", "preact"], t)
		: t((n.preactCompat = {}), n.preactHooks, n.preact);
})(this, function (n, t, e) {
	function r(n, t) {
		for (var e in t) n[e] = t[e];
		return n;
	}
	function u(n, t) {
		for (var e in n) if ("__source" !== e && !(e in t)) return !0;
		for (var r in t) if ("__source" !== r && n[r] !== t[r]) return !0;
		return !1;
	}
	function i(n) {
		this.props = n;
	}
	function o(n, t) {
		function r(n) {
			var e = this.props.ref,
				r = e == n.ref;
			return (
				!r && e && (e.call ? e(null) : (e.current = null)),
				t ? !t(this.props, n) || !r : u(this.props, n)
			);
		}
		function i(t) {
			return (this.shouldComponentUpdate = r), e.createElement(n, t);
		}
		return (
			(i.displayName = "Memo(" + (n.displayName || n.name) + ")"),
			(i.prototype.isReactComponent = !0),
			(i.__f = !0),
			i
		);
	}
	((i.prototype = new e.Component()).isPureReactComponent = !0),
		(i.prototype.shouldComponentUpdate = function (n, t) {
			return u(this.props, n) || u(this.state, t);
		});
	var f = e.options.__b;
	e.options.__b = function (n) {
		n.type && n.type.__f && n.ref && ((n.props.ref = n.ref), (n.ref = null)),
			f && f(n);
	};
	var l =
		("undefined" != typeof Symbol &&
			Symbol.for &&
			Symbol.for("react.forward_ref")) ||
		3911;
	function c(n) {
		function t(t, e) {
			var u = r({}, t);
			return (
				delete u.ref,
				n(
					u,
					(e = t.ref || e) && ("object" != typeof e || "current" in e)
						? e
						: null,
				)
			);
		}
		return (
			(t.$$typeof = l),
			(t.render = t),
			(t.prototype.isReactComponent = t.__f = !0),
			(t.displayName = "ForwardRef(" + (n.displayName || n.name) + ")"),
			t
		);
	}
	var a = function (n, t) {
			return null == n ? null : e.toChildArray(e.toChildArray(n).map(t));
		},
		s = {
			map: a,
			forEach: a,
			count: function (n) {
				return n ? e.toChildArray(n).length : 0;
			},
			only: function (n) {
				var t = e.toChildArray(n);
				if (1 !== t.length) throw "Children.only";
				return t[0];
			},
			toArray: e.toChildArray,
		},
		h = e.options.__e;
	function d() {
		(this.__u = 0), (this.t = null), (this.__b = null);
	}
	function v(n) {
		var t = n.__.__c;
		return t && t.__e && t.__e(n);
	}
	function p(n) {
		var t, r, u;
		function i(i) {
			if (
				(t ||
					(t = n()).then(
						function (n) {
							r = n.default || n;
						},
						function (n) {
							u = n;
						},
					),
				u)
			)
				throw u;
			if (!r) throw t;
			return e.createElement(r, i);
		}
		return (i.displayName = "Lazy"), (i.__f = !0), i;
	}
	function m() {
		(this.u = null), (this.i = null);
	}
	(e.options.__e = function (n, t, e) {
		if (n.then)
			for (var r, u = t; (u = u.__); )
				if ((r = u.__c) && r.__c)
					return (
						null == t.__e && ((t.__e = e.__e), (t.__k = e.__k)), r.__c(n, t)
					);
		h(n, t, e);
	}),
		((d.prototype = new e.Component()).__c = function (n, t) {
			var e = t.__c,
				r = this;
			null == r.t && (r.t = []), r.t.push(e);
			var u = v(r.__v),
				i = !1,
				o = function () {
					i || ((i = !0), (e.componentWillUnmount = e.__c), u ? u(f) : f());
				};
			(e.__c = e.componentWillUnmount),
				(e.componentWillUnmount = function () {
					o(), e.__c && e.__c();
				});
			var f = function () {
					if (!--r.__u) {
						if (r.state.__e) {
							var n = r.state.__e;
							r.__v.__k[0] = (function n(t, e, r) {
								return (
									t &&
										((t.__v = null),
										(t.__k =
											t.__k &&
											t.__k.map(function (t) {
												return n(t, e, r);
											})),
										t.__c &&
											t.__c.__P === e &&
											(t.__e && r.insertBefore(t.__e, t.__d),
											(t.__c.__e = !0),
											(t.__c.__P = r))),
									t
								);
							})(n, n.__c.__P, n.__c.__O);
						}
						var t;
						for (r.setState({ __e: (r.__b = null) }); (t = r.t.pop()); )
							t.forceUpdate();
					}
				},
				l = !0 === t.__h;
			r.__u++ || l || r.setState({ __e: (r.__b = r.__v.__k[0]) }), n.then(o, o);
		}),
		(d.prototype.componentWillUnmount = function () {
			this.t = [];
		}),
		(d.prototype.render = function (n, t) {
			if (this.__b) {
				if (this.__v.__k) {
					var u = document.createElement("div"),
						i = this.__v.__k[0].__c;
					this.__v.__k[0] = (function n(t, e, u) {
						return (
							t &&
								(t.__c &&
									t.__c.__H &&
									(t.__c.__H.__.forEach(function (n) {
										"function" == typeof n.__c && n.__c();
									}),
									(t.__c.__H = null)),
								null != (t = r({}, t)).__c &&
									(t.__c.__P === u && (t.__c.__P = e), (t.__c = null)),
								(t.__k =
									t.__k &&
									t.__k.map(function (t) {
										return n(t, e, u);
									}))),
							t
						);
					})(this.__b, u, (i.__O = i.__P));
				}
				this.__b = null;
			}
			var o = t.__e && e.createElement(e.Fragment, null, n.fallback);
			return (
				o && (o.__h = null),
				[e.createElement(e.Fragment, null, t.__e ? null : n.children), o]
			);
		});
	var y = function (n, t, e) {
		if (
			(++e[1] === e[0] && n.i.delete(t),
			n.props.revealOrder && ("t" !== n.props.revealOrder[0] || !n.i.size))
		)
			for (e = n.u; e; ) {
				for (; e.length > 3; ) e.pop()();
				if (e[1] < e[0]) break;
				n.u = e = e[2];
			}
	};
	function b(n) {
		return (
			(this.getChildContext = function () {
				return n.context;
			}),
			n.children
		);
	}
	function _(n) {
		var t = this,
			r = n.o;
		(t.componentWillUnmount = function () {
			e.render(null, t.l), (t.l = null), (t.o = null);
		}),
			t.o && t.o !== r && t.componentWillUnmount(),
			n.__v
				? (t.l ||
						((t.o = r),
						(t.l = {
							nodeType: 1,
							parentNode: r,
							childNodes: [],
							appendChild: function (n) {
								this.childNodes.push(n), t.o.appendChild(n);
							},
							insertBefore: function (n, e) {
								this.childNodes.push(n), t.o.appendChild(n);
							},
							removeChild: function (n) {
								this.childNodes.splice(this.childNodes.indexOf(n) >>> 1, 1),
									t.o.removeChild(n);
							},
						})),
				  e.render(e.createElement(b, { context: t.context }, n.__v), t.l))
				: t.l && t.componentWillUnmount();
	}
	function S(n, t) {
		return e.createElement(_, { __v: n, o: t });
	}
	((m.prototype = new e.Component()).__e = function (n) {
		var t = this,
			e = v(t.__v),
			r = t.i.get(n);
		return (
			r[0]++,
			function (u) {
				var i = function () {
					t.props.revealOrder ? (r.push(u), y(t, n, r)) : u();
				};
				e ? e(i) : i();
			}
		);
	}),
		(m.prototype.render = function (n) {
			(this.u = null), (this.i = new Map());
			var t = e.toChildArray(n.children);
			n.revealOrder && "b" === n.revealOrder[0] && t.reverse();
			for (var r = t.length; r--; ) this.i.set(t[r], (this.u = [1, 0, this.u]));
			return n.children;
		}),
		(m.prototype.componentDidUpdate = m.prototype.componentDidMount = function () {
			var n = this;
			this.i.forEach(function (t, e) {
				y(n, e, t);
			});
		});
	var w =
			("undefined" != typeof Symbol &&
				Symbol.for &&
				Symbol.for("react.element")) ||
			60103,
		C = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|fill|flood|font|glyph(?!R)|horiz|marker(?!H|W|U)|overline|paint|stop|strikethrough|stroke|text(?!L)|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/,
		g = function (n) {
			return ("undefined" != typeof Symbol && "symbol" == typeof Symbol()
				? /fil|che|rad/i
				: /fil|che|ra/i
			).test(n);
		};
	function E(n, t, r) {
		return (
			null == t.__k && (t.textContent = ""),
			e.render(n, t),
			"function" == typeof r && r(),
			n ? n.__c : null
		);
	}
	function R(n, t, r) {
		return e.hydrate(n, t), "function" == typeof r && r(), n ? n.__c : null;
	}
	(e.Component.prototype.isReactComponent = {}),
		[
			"componentWillMount",
			"componentWillReceiveProps",
			"componentWillUpdate",
		].forEach(function (n) {
			Object.defineProperty(e.Component.prototype, n, {
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
	var x = e.options.event;
	function N() {}
	function k() {
		return this.cancelBubble;
	}
	function O() {
		return this.defaultPrevented;
	}
	e.options.event = function (n) {
		return (
			x && (n = x(n)),
			(n.persist = N),
			(n.isPropagationStopped = k),
			(n.isDefaultPrevented = O),
			(n.nativeEvent = n)
		);
	};
	var A,
		L = {
			configurable: !0,
			get: function () {
				return this.class;
			},
		},
		U = e.options.vnode;
	e.options.vnode = function (n) {
		var t = n.type,
			r = n.props,
			u = r;
		if ("string" == typeof t) {
			for (var i in ((u = {}), r)) {
				var o = r[i];
				"defaultValue" === i && "value" in r && null == r.value
					? (i = "value")
					: "download" === i && !0 === o
					? (o = "")
					: /ondoubleclick/i.test(i)
					? (i = "ondblclick")
					: /^onchange(textarea|input)/i.test(i + t) && !g(r.type)
					? (i = "oninput")
					: /^on(Ani|Tra|Tou|BeforeInp)/.test(i)
					? (i = i.toLowerCase())
					: C.test(i)
					? (i = i.replace(/[A-Z0-9]/, "-$&").toLowerCase())
					: null === o && (o = void 0),
					(u[i] = o);
			}
			"select" == t &&
				u.multiple &&
				Array.isArray(u.value) &&
				(u.value = e.toChildArray(r.children).forEach(function (n) {
					n.props.selected = -1 != u.value.indexOf(n.props.value);
				})),
				"select" == t &&
					null != u.defaultValue &&
					(u.value = e.toChildArray(r.children).forEach(function (n) {
						n.props.selected = u.multiple
							? -1 != u.defaultValue.indexOf(n.props.value)
							: u.defaultValue == n.props.value;
					})),
				(n.props = u);
		}
		t &&
			r.class != r.className &&
			((L.enumerable = "className" in r),
			null != r.className && (u.class = r.className),
			Object.defineProperty(u, "className", L)),
			(n.$$typeof = w),
			U && U(n);
	};
	var j = e.options.__r;
	e.options.__r = function (n) {
		j && j(n), (A = n.__c);
	};
	var M = {
		ReactCurrentDispatcher: {
			current: {
				readContext: function (n) {
					return A.__n[n.__c].props.value;
				},
			},
		},
	};
	function T(n) {
		return e.createElement.bind(null, n);
	}
	function D(n) {
		return !!n && n.$$typeof === w;
	}
	function F(n) {
		return D(n) ? e.cloneElement.apply(null, arguments) : n;
	}
	function I(n) {
		return !!n.__k && (e.render(null, n), !0);
	}
	function W(n) {
		return (n && (n.base || (1 === n.nodeType && n))) || null;
	}
	var P = function (n, t) {
			return n(t);
		},
		z = e.Fragment,
		B = {
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
			version: "16.8.0",
			Children: s,
			render: E,
			hydrate: R,
			unmountComponentAtNode: I,
			createPortal: S,
			createElement: e.createElement,
			createContext: e.createContext,
			createFactory: T,
			cloneElement: F,
			createRef: e.createRef,
			Fragment: e.Fragment,
			isValidElement: D,
			findDOMNode: W,
			Component: e.Component,
			PureComponent: i,
			memo: o,
			forwardRef: c,
			unstable_batchedUpdates: P,
			StrictMode: z,
			Suspense: d,
			SuspenseList: m,
			lazy: p,
			__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: M,
		};
	Object.keys(t).forEach(function (e) {
		n[e] = t[e];
	}),
		(n.createElement = e.createElement),
		(n.createContext = e.createContext),
		(n.createRef = e.createRef),
		(n.Fragment = e.Fragment),
		(n.Component = e.Component),
		(n.version = "16.8.0"),
		(n.Children = s),
		(n.render = E),
		(n.hydrate = R),
		(n.unmountComponentAtNode = I),
		(n.createPortal = S),
		(n.createFactory = T),
		(n.cloneElement = F),
		(n.isValidElement = D),
		(n.findDOMNode = W),
		(n.PureComponent = i),
		(n.memo = o),
		(n.forwardRef = c),
		(n.unstable_batchedUpdates = P),
		(n.StrictMode = z),
		(n.Suspense = d),
		(n.SuspenseList = m),
		(n.lazy = p),
		(n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = M),
		(n.default = B);
});
//# sourceMappingURL=compat.umd.js.map
