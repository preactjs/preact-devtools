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
	function o(n) {
		var t = n.parentNode;
		t && t.removeChild(n);
	}
	var i = e.options.__e;
	function u() {
		this.t = [];
	}
	function f(n) {
		var t, r, o;
		function i(i) {
			if (
				(t ||
					(t = n()).then(
						function (n) {
							r = n.default;
						},
						function (n) {
							o = n;
						},
					),
				o)
			)
				throw o;
			if (!r) throw t;
			return e.createElement(r, i);
		}
		return (i.displayName = "Lazy"), i;
	}
	(e.options.__e = function (n, t, e) {
		if (n.then && e)
			for (var r, o = t; (o = o.__p); )
				if ((r = o.__c) && r.o)
					return e && ((t.__e = e.__e), (t.__k = e.__k)), void r.o(n);
		i(n, t, e);
	}),
		((u.prototype = new e.Component()).o = function (n) {
			var t = this;
			t.t.push(n);
			var r = function () {
				(t.t[t.t.indexOf(n)] = t.t[t.t.length - 1]),
					t.t.pop(),
					0 == t.t.length &&
						(e._e(t.props.fallback),
						(t.__v.__e = null),
						(t.__v.__k = t.state.i),
						t.setState({ i: null }));
			};
			null == t.state.i &&
				(t.setState({ i: t.__v.__k }),
				(function n(t) {
					for (var e = 0; e < t.length; e++) {
						var r = t[e];
						null != r &&
							("function" != typeof r.type && r.__e
								? o(r.__e)
								: r.__k && n(r.__k));
					}
				})(t.__v.__k),
				(t.__v.__k = [])),
				n.then(r, r);
		}),
		(u.prototype.render = function (n, t) {
			return t.i ? n.fallback : n.children;
		});
	var c =
			("undefined" != typeof Symbol &&
				Symbol.for &&
				Symbol.for("react.element")) ||
			60103,
		a = /^(?:accent|alignment|arabic|baseline|cap|clip|color|fill|flood|font|glyph|horiz|marker|overline|paint|stop|strikethrough|stroke|text|underline|unicode|units|v|vector|vert|word|writing|x)[A-Z]/,
		l = e.options.event;
	function d(n) {
		return b.bind(null, n);
	}
	function s(n, t, r) {
		for (; t.firstChild; ) o(t.firstChild);
		return e.render(n, t), "function" == typeof r && r(), n ? n.__c : null;
	}
	e.options.event = function (n) {
		return l && (n = l(n)), (n.persist = function () {}), (n.nativeEvent = n);
	};
	var v = function () {};
	function p(n) {
		var t = this,
			r = n.container,
			o = e.h(v, { context: t.context }, n.vnode);
		return (
			t.u &&
				t.u !== r &&
				(t.l.parentNode && t.u.removeChild(t.l), e._e(t.s), (t.v = !1)),
			n.vnode
				? t.v
					? s(o, r)
					: ((t.l = document.createTextNode("")),
					  e.hydrate("", r),
					  r.insertBefore(t.l, r.firstChild),
					  (t.v = !0),
					  (t.u = r),
					  e.render(o, r, t.l))
				: t.v && (t.l.parentNode && t.u.removeChild(t.l), e._e(t.s)),
			(t.s = o),
			(t.componentWillUnmount = function () {
				t.l.parentNode && t.u.removeChild(t.l), e._e(t.s);
			}),
			null
		);
	}
	function h(n, t) {
		return e.h(p, { vnode: n, container: t });
	}
	(v.prototype.getChildContext = function () {
		return this.props.context;
	}),
		(v.prototype.render = function (n) {
			return n.children;
		});
	var m = function (n, t) {
			return n ? e.toChildArray(n).map(t) : null;
		},
		y = {
			map: m,
			forEach: m,
			count: function (n) {
				return n ? e.toChildArray(n).length : 0;
			},
			only: function (n) {
				if (1 !== (n = e.toChildArray(n)).length)
					throw new Error("Children.only() expects only one child.");
				return n[0];
			},
			toArray: e.toChildArray,
		};
	function b() {
		for (var n = [], t = arguments.length; t--; ) n[t] = arguments[t];
		var r = e.h.apply(void 0, n),
			o = r.type,
			i = r.props;
		return (
			"function" != typeof o &&
				(i.defaultValue &&
					(i.value || 0 === i.value || (i.value = i.defaultValue),
					delete i.defaultValue),
				Array.isArray(i.value) &&
					i.multiple &&
					"select" === o &&
					(e.toChildArray(i.children).forEach(function (n) {
						-1 != i.value.indexOf(n.props.value) && (n.props.selected = !0);
					}),
					delete i.value),
				(function (n, t) {
					var e, r, o;
					for (o in t) if ((e = a.test(o))) break;
					if (e)
						for (o in ((r = n.props = {}), t))
							r[a.test(o) ? o.replace(/([A-Z0-9])/, "-$1").toLowerCase() : o] =
								t[o];
				})(r, i)),
			(r.preactCompatNormalized = !1),
			g(r)
		);
	}
	function g(n) {
		return (
			(n.preactCompatNormalized = !0),
			(function (n) {
				var t = n.props;
				(t.class || t.className) &&
					((C.enumerable = "className" in t),
					t.className && (t.class = t.className),
					Object.defineProperty(t, "className", C));
			})(n),
			n
		);
	}
	function w(n) {
		return x(n) ? g(e.cloneElement.apply(null, arguments)) : n;
	}
	function x(n) {
		return !!n && n.$$typeof === c;
	}
	function k(n) {
		return !!n.__k && (e.render(null, n), !0);
	}
	var C = {
		configurable: !0,
		get: function () {
			return this.class;
		},
	};
	function A(n, t) {
		for (var e in n) if (!(e in t)) return !0;
		for (var r in t) if (n[r] !== t[r]) return !0;
		return !1;
	}
	function E(n) {
		return (n && (n.base || (1 === n.nodeType && n))) || null;
	}
	var j = (function (n) {
		function t(t) {
			n.call(this, t), (this.isPureReactComponent = !0);
		}
		return (
			n && (t.__proto__ = n),
			((t.prototype = Object.create(n && n.prototype)).constructor = t),
			(t.prototype.shouldComponentUpdate = function (n, t) {
				return A(this.props, n) || A(this.state, t);
			}),
			t
		);
	})(e.Component);
	function N(n, t) {
		function o(n) {
			var e = this.props.ref,
				r = e == n.ref;
			return (
				r || (e.call ? e(null) : (e.current = null)),
				(t ? !t(this.props, n) : A(this.props, n)) || !r
			);
		}
		function i(t) {
			return (this.shouldComponentUpdate = o), e.h(n, r({}, t));
		}
		return (
			(i.displayName = "Memo(" + (n.displayName || n.name) + ")"), (i.p = !0), i
		);
	}
	function O(n, t) {
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
	function S(n) {
		function t(t) {
			var e = t.ref;
			return delete t.ref, n(t, e);
		}
		return (
			(t.p = !0),
			(t.displayName = "ForwardRef(" + (n.displayName || n.name) + ")"),
			t
		);
	}
	(e.Component.prototype.isReactComponent = {}),
		O(e.Component, "componentWillMount"),
		O(e.Component, "componentWillReceiveProps"),
		O(e.Component, "componentWillUpdate");
	var F = e.options.vnode;
	e.options.vnode = function (n) {
		(n.$$typeof = c),
			(function (t) {
				var e = n.type,
					r = n.props;
				if (r && "string" == typeof e) {
					var o = {};
					for (var i in r) o[i.toLowerCase()] = i;
					if (
						(o.ondoubleclick &&
							((r.ondblclick = r[o.ondoubleclick]), delete r[o.ondoubleclick]),
						o.onbeforeinput &&
							((r.onbeforeinput = r[o.onbeforeinput]),
							delete r[o.onbeforeinput]),
						o.onchange &&
							("textarea" === e ||
								("input" === e.toLowerCase() && !/^fil|che|rad/i.test(r.type))))
					) {
						var u = o.oninput || "oninput";
						r[u] || ((r[u] = r[o.onchange]), delete r[o.onchange]);
					}
				}
			})();
		var t = n.type;
		t && t.p && n.ref && ((n.props.ref = n.ref), (n.ref = null)), F && F(n);
	};
	var R = function (n, t) {
			return n(t);
		},
		_ = r(
			{
				version: "16.8.0",
				Children: y,
				render: s,
				hydrate: s,
				unmountComponentAtNode: k,
				createPortal: h,
				createElement: b,
				createContext: e.createContext,
				createFactory: d,
				cloneElement: w,
				createRef: e.createRef,
				Fragment: e.Fragment,
				isValidElement: x,
				findDOMNode: E,
				Component: e.Component,
				PureComponent: j,
				memo: N,
				forwardRef: S,
				unstable_batchedUpdates: R,
				Suspense: u,
				lazy: f,
			},
			t,
		);
	Object.keys(t).forEach(function (e) {
		n[e] = t[e];
	}),
		(n.createContext = e.createContext),
		(n.createRef = e.createRef),
		(n.Fragment = e.Fragment),
		(n.Component = e.Component),
		(n.version = "16.8.0"),
		(n.Children = y),
		(n.render = s),
		(n.hydrate = s),
		(n.unmountComponentAtNode = k),
		(n.createPortal = h),
		(n.createElement = b),
		(n.createFactory = d),
		(n.cloneElement = w),
		(n.isValidElement = x),
		(n.findDOMNode = E),
		(n.PureComponent = j),
		(n.memo = N),
		(n.forwardRef = S),
		(n.unstable_batchedUpdates = R),
		(n.Suspense = u),
		(n.lazy = f),
		(n.default = _);
});
//# sourceMappingURL=compat.umd.js.map
