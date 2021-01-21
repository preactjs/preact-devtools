!(function (n, l) {
	"object" == typeof exports && "undefined" != typeof module
		? l(exports)
		: "function" == typeof define && define.amd
		? define(["exports"], l)
		: l((n.preact = {}));
})(this, function (n) {
	var l,
		u,
		i,
		t,
		o,
		f,
		r = {},
		e = [],
		c = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
	function s(n, l) {
		for (var u in l) n[u] = l[u];
		return n;
	}
	function a(n) {
		var l = n.parentNode;
		l && l.removeChild(n);
	}
	function v(n, l, u) {
		var i,
			t,
			o,
			f = arguments,
			r = {};
		for (o in l)
			"key" == o ? (i = l[o]) : "ref" == o ? (t = l[o]) : (r[o] = l[o]);
		if (arguments.length > 3)
			for (u = [u], o = 3; o < arguments.length; o++) u.push(f[o]);
		if (
			(null != u && (r.children = u),
			"function" == typeof n && null != n.defaultProps)
		)
			for (o in n.defaultProps) void 0 === r[o] && (r[o] = n.defaultProps[o]);
		return h(n, r, i, t, null);
	}
	function h(n, u, i, t, o) {
		var f = {
			type: n,
			props: u,
			key: i,
			ref: t,
			__k: null,
			__: null,
			__b: 0,
			__e: null,
			__d: void 0,
			__c: null,
			__h: null,
			constructor: void 0,
			__v: null == o ? ++l.__v : o,
		};
		return null != l.vnode && l.vnode(f), f;
	}
	function y(n) {
		return n.children;
	}
	function p(n, l) {
		(this.props = n), (this.context = l);
	}
	function d(n, l) {
		if (null == l) return n.__ ? d(n.__, n.__.__k.indexOf(n) + 1) : null;
		for (var u; l < n.__k.length; l++)
			if (null != (u = n.__k[l]) && null != u.__e) return u.__e;
		return "function" == typeof n.type ? d(n) : null;
	}
	function _(n) {
		var l, u;
		if (null != (n = n.__) && null != n.__c) {
			for (n.__e = n.__c.base = null, l = 0; l < n.__k.length; l++)
				if (null != (u = n.__k[l]) && null != u.__e) {
					n.__e = n.__c.base = u.__e;
					break;
				}
			return _(n);
		}
	}
	function k(n) {
		((!n.__d && (n.__d = !0) && i.push(n) && !m.__r++) ||
			o !== l.debounceRendering) &&
			((o = l.debounceRendering) || t)(m);
	}
	function m() {
		for (var n; (m.__r = i.length); )
			(n = i.sort(function (n, l) {
				return n.__v.__b - l.__v.__b;
			})),
				(i = []),
				n.some(function (n) {
					var l, u, i, t, o, f;
					n.__d &&
						((o = (t = (l = n).__v).__e),
						(f = l.__P) &&
							((u = []),
							((i = s({}, t)).__v = t.__v + 1),
							j(
								f,
								t,
								i,
								l.__n,
								void 0 !== f.ownerSVGElement,
								null != t.__h ? [o] : null,
								u,
								null == o ? d(t) : o,
								t.__h,
							),
							H(u, t),
							t.__e != o && _(t)));
				});
	}
	function b(n, l, u, i, t, o, f, c, s, a) {
		var v,
			p,
			_,
			k,
			m,
			b,
			x,
			A = (i && i.__k) || e,
			P = A.length;
		for (u.__k = [], v = 0; v < l.length; v++)
			if (
				null !=
				(k = u.__k[v] =
					null == (k = l[v]) || "boolean" == typeof k
						? null
						: "string" == typeof k || "number" == typeof k
						? h(null, k, null, null, k)
						: Array.isArray(k)
						? h(y, { children: k }, null, null, null)
						: k.__b > 0
						? h(k.type, k.props, k.key, null, k.__v)
						: k)
			) {
				if (
					((k.__ = u),
					(k.__b = u.__b + 1),
					null === (_ = A[v]) || (_ && k.key == _.key && k.type === _.type))
				)
					A[v] = void 0;
				else
					for (p = 0; p < P; p++) {
						if ((_ = A[p]) && k.key == _.key && k.type === _.type) {
							A[p] = void 0;
							break;
						}
						_ = null;
					}
				j(n, k, (_ = _ || r), t, o, f, c, s, a),
					(m = k.__e),
					(p = k.ref) &&
						_.ref != p &&
						(x || (x = []),
						_.ref && x.push(_.ref, null, k),
						x.push(p, k.__c || m, k)),
					null != m
						? (null == b && (b = m),
						  "function" == typeof k.type && null != k.__k && k.__k === _.__k
								? (k.__d = s = g(k, s, n))
								: (s = w(n, k, _, A, m, s)),
						  a || "option" !== u.type
								? "function" == typeof u.type && (u.__d = s)
								: (n.value = ""))
						: s && _.__e == s && s.parentNode != n && (s = d(_));
			}
		for (u.__e = b, v = P; v--; )
			null != A[v] &&
				("function" == typeof u.type &&
					null != A[v].__e &&
					A[v].__e == u.__d &&
					(u.__d = d(i, v + 1)),
				I(A[v], A[v]));
		if (x) for (v = 0; v < x.length; v++) z(x[v], x[++v], x[++v]);
	}
	function g(n, l, u) {
		var i, t;
		for (i = 0; i < n.__k.length; i++)
			(t = n.__k[i]) &&
				((t.__ = n),
				(l =
					"function" == typeof t.type
						? g(t, l, u)
						: w(u, t, t, n.__k, t.__e, l)));
		return l;
	}
	function w(n, l, u, i, t, o) {
		var f, r, e;
		if (void 0 !== l.__d) (f = l.__d), (l.__d = void 0);
		else if (null == u || t != o || null == t.parentNode)
			n: if (null == o || o.parentNode !== n) n.appendChild(t), (f = null);
			else {
				for (r = o, e = 0; (r = r.nextSibling) && e < i.length; e += 2)
					if (r == t) break n;
				n.insertBefore(t, o), (f = o);
			}
		return void 0 !== f ? f : t.nextSibling;
	}
	function x(n, l, u, i, t) {
		var o;
		for (o in u)
			"children" === o || "key" === o || o in l || P(n, o, null, u[o], i);
		for (o in l)
			(t && "function" != typeof l[o]) ||
				"children" === o ||
				"key" === o ||
				"value" === o ||
				"checked" === o ||
				u[o] === l[o] ||
				P(n, o, l[o], u[o], i);
	}
	function A(n, l, u) {
		"-" === l[0]
			? n.setProperty(l, u)
			: (n[l] =
					null == u ? "" : "number" != typeof u || c.test(l) ? u : u + "px");
	}
	function P(n, l, u, i, t) {
		var o;
		n: if ("style" === l)
			if ("string" == typeof u) n.style.cssText = u;
			else {
				if (("string" == typeof i && (n.style.cssText = i = ""), i))
					for (l in i) (u && l in u) || A(n.style, l, "");
				if (u) for (l in u) (i && u[l] === i[l]) || A(n.style, l, u[l]);
			}
		else if ("o" === l[0] && "n" === l[1])
			(o = l !== (l = l.replace(/Capture$/, ""))),
				(l = l.toLowerCase() in n ? l.toLowerCase().slice(2) : l.slice(2)),
				n.l || (n.l = {}),
				(n.l[l + o] = u),
				u
					? i || n.addEventListener(l, o ? $ : C, o)
					: n.removeEventListener(l, o ? $ : C, o);
		else if ("dangerouslySetInnerHTML" !== l) {
			if (t) l = l.replace(/xlink[H:h]/, "h").replace(/sName$/, "s");
			else if (
				"href" !== l &&
				"list" !== l &&
				"form" !== l &&
				"download" !== l &&
				l in n
			)
				try {
					n[l] = null == u ? "" : u;
					break n;
				} catch (n) {}
			"function" == typeof u ||
				(null != u && (!1 !== u || ("a" === l[0] && "r" === l[1]))
					? n.setAttribute(l, u)
					: n.removeAttribute(l));
		}
	}
	function C(n) {
		this.l[n.type + !1](l.event ? l.event(n) : n);
	}
	function $(n) {
		this.l[n.type + !0](l.event ? l.event(n) : n);
	}
	function j(n, u, i, t, o, f, r, e, c) {
		var a,
			v,
			h,
			d,
			_,
			k,
			m,
			g,
			w,
			x,
			A,
			P = u.type;
		if (void 0 !== u.constructor) return null;
		null != i.__h &&
			((c = i.__h), (e = u.__e = i.__e), (u.__h = null), (f = [e])),
			(a = l.__b) && a(u);
		try {
			n: if ("function" == typeof P) {
				if (
					((g = u.props),
					(w = (a = P.contextType) && t[a.__c]),
					(x = a ? (w ? w.props.value : a.__) : t),
					i.__c
						? (m = (v = u.__c = i.__c).__ = v.__E)
						: ("prototype" in P && P.prototype.render
								? (u.__c = v = new P(g, x))
								: ((u.__c = v = new p(g, x)),
								  (v.constructor = P),
								  (v.render = L)),
						  w && w.sub(v),
						  (v.props = g),
						  v.state || (v.state = {}),
						  (v.context = x),
						  (v.__n = t),
						  (h = v.__d = !0),
						  (v.__h = [])),
					null == v.__s && (v.__s = v.state),
					null != P.getDerivedStateFromProps &&
						(v.__s == v.state && (v.__s = s({}, v.__s)),
						s(v.__s, P.getDerivedStateFromProps(g, v.__s))),
					(d = v.props),
					(_ = v.state),
					h)
				)
					null == P.getDerivedStateFromProps &&
						null != v.componentWillMount &&
						v.componentWillMount(),
						null != v.componentDidMount && v.__h.push(v.componentDidMount);
				else {
					if (
						(null == P.getDerivedStateFromProps &&
							g !== d &&
							null != v.componentWillReceiveProps &&
							v.componentWillReceiveProps(g, x),
						(!v.__e &&
							null != v.shouldComponentUpdate &&
							!1 === v.shouldComponentUpdate(g, v.__s, x)) ||
							u.__v === i.__v)
					) {
						(v.props = g),
							(v.state = v.__s),
							u.__v !== i.__v && (v.__d = !1),
							(v.__v = u),
							(u.__e = i.__e),
							(u.__k = i.__k),
							v.__h.length && r.push(v);
						break n;
					}
					null != v.componentWillUpdate && v.componentWillUpdate(g, v.__s, x),
						null != v.componentDidUpdate &&
							v.__h.push(function () {
								v.componentDidUpdate(d, _, k);
							});
				}
				(v.context = x),
					(v.props = g),
					(v.state = v.__s),
					(a = l.__r) && a(u),
					(v.__d = !1),
					(v.__v = u),
					(v.__P = n),
					(a = v.render(v.props, v.state, v.context)),
					(v.state = v.__s),
					null != v.getChildContext && (t = s(s({}, t), v.getChildContext())),
					h ||
						null == v.getSnapshotBeforeUpdate ||
						(k = v.getSnapshotBeforeUpdate(d, _)),
					(A =
						null != a && a.type === y && null == a.key ? a.props.children : a),
					b(n, Array.isArray(A) ? A : [A], u, i, t, o, f, r, e, c),
					(v.base = u.__e),
					(u.__h = null),
					v.__h.length && r.push(v),
					m && (v.__E = v.__ = null),
					(v.__e = !1);
			} else null == f && u.__v === i.__v ? ((u.__k = i.__k), (u.__e = i.__e)) : (u.__e = T(i.__e, u, i, t, o, f, r, c));
			(a = l.diffed) && a(u);
		} catch (n) {
			(u.__v = null),
				(c || null != f) &&
					((u.__e = e), (u.__h = !!c), (f[f.indexOf(e)] = null)),
				l.__e(n, u, i);
		}
	}
	function H(n, u) {
		l.__c && l.__c(u, n),
			n.some(function (u) {
				try {
					(n = u.__h),
						(u.__h = []),
						n.some(function (n) {
							n.call(u);
						});
				} catch (n) {
					l.__e(n, u.__v);
				}
			});
	}
	function T(n, l, u, i, t, o, f, c) {
		var s,
			v,
			h,
			y,
			p,
			d = u.props,
			_ = l.props,
			k = l.type;
		if (("svg" === k && (t = !0), null != o))
			for (s = 0; s < o.length; s++)
				if (null != (v = o[s]) && (n == v || v.localName == k)) {
					(n = v), (o[s] = null);
					break;
				}
		if (null == n) {
			if (null === k) return document.createTextNode(_);
			(n = t
				? document.createElementNS("http://www.w3.org/2000/svg", k)
				: document.createElement(k, _.is && _)),
				(o = null),
				(c = !1);
		}
		if (null === k) d === _ || (c && n.data === _) || (n.data = _);
		else {
			if (
				(null != o && (o = e.slice.call(n.childNodes)),
				(h = (d = u.props || r).dangerouslySetInnerHTML),
				(y = _.dangerouslySetInnerHTML),
				!c)
			) {
				if (null != o)
					for (d = {}, p = 0; p < n.attributes.length; p++)
						d[n.attributes[p].name] = n.attributes[p].value;
				(y || h) &&
					((y && ((h && y.__html == h.__html) || y.__html === n.innerHTML)) ||
						(n.innerHTML = (y && y.__html) || ""));
			}
			if ((x(n, _, d, t, c), y)) l.__k = [];
			else if (
				((s = l.props.children),
				b(
					n,
					Array.isArray(s) ? s : [s],
					l,
					u,
					i,
					t && "foreignObject" !== k,
					o,
					f,
					n.firstChild,
					c,
				),
				null != o)
			)
				for (s = o.length; s--; ) null != o[s] && a(o[s]);
			c ||
				("value" in _ &&
					void 0 !== (s = _.value) &&
					(s !== n.value || ("progress" === k && !s)) &&
					P(n, "value", s, d.value, !1),
				"checked" in _ &&
					void 0 !== (s = _.checked) &&
					s !== n.checked &&
					P(n, "checked", s, d.checked, !1));
		}
		return n;
	}
	function z(n, u, i) {
		try {
			"function" == typeof n ? n(u) : (n.current = u);
		} catch (n) {
			l.__e(n, i);
		}
	}
	function I(n, u, i) {
		var t, o, f;
		if (
			(l.unmount && l.unmount(n),
			(t = n.ref) && ((t.current && t.current !== n.__e) || z(t, null, u)),
			i || "function" == typeof n.type || (i = null != (o = n.__e)),
			(n.__e = n.__d = void 0),
			null != (t = n.__c))
		) {
			if (t.componentWillUnmount)
				try {
					t.componentWillUnmount();
				} catch (n) {
					l.__e(n, u);
				}
			t.base = t.__P = null;
		}
		if ((t = n.__k)) for (f = 0; f < t.length; f++) t[f] && I(t[f], u, i);
		null != o && a(o);
	}
	function L(n, l, u) {
		return this.constructor(n, u);
	}
	function M(n, u, i) {
		var t, o, f;
		l.__ && l.__(n, u),
			(o = (t = "function" == typeof i) ? null : (i && i.__k) || u.__k),
			(f = []),
			j(
				u,
				(n = ((!t && i) || u).__k = v(y, null, [n])),
				o || r,
				r,
				void 0 !== u.ownerSVGElement,
				!t && i
					? [i]
					: o
					? null
					: u.firstChild
					? e.slice.call(u.childNodes)
					: null,
				f,
				!t && i ? i : o ? o.__e : u.firstChild,
				t,
			),
			H(f, n);
	}
	(l = {
		__e: function (n, l) {
			for (var u, i, t; (l = l.__); )
				if ((u = l.__c) && !u.__)
					try {
						if (
							((i = u.constructor) &&
								null != i.getDerivedStateFromError &&
								(u.setState(i.getDerivedStateFromError(n)), (t = u.__d)),
							null != u.componentDidCatch &&
								(u.componentDidCatch(n), (t = u.__d)),
							t)
						)
							return (u.__E = u);
					} catch (l) {
						n = l;
					}
			throw n;
		},
		__v: 0,
	}),
		(u = function (n) {
			return null != n && void 0 === n.constructor;
		}),
		(p.prototype.setState = function (n, l) {
			var u;
			(u =
				null != this.__s && this.__s !== this.state
					? this.__s
					: (this.__s = s({}, this.state))),
				"function" == typeof n && (n = n(s({}, u), this.props)),
				n && s(u, n),
				null != n && this.__v && (l && this.__h.push(l), k(this));
		}),
		(p.prototype.forceUpdate = function (n) {
			this.__v && ((this.__e = !0), n && this.__h.push(n), k(this));
		}),
		(p.prototype.render = y),
		(i = []),
		(t =
			"function" == typeof Promise
				? Promise.prototype.then.bind(Promise.resolve())
				: setTimeout),
		(m.__r = 0),
		(f = 0),
		(n.render = M),
		(n.hydrate = function n(l, u) {
			M(l, u, n);
		}),
		(n.createElement = v),
		(n.h = v),
		(n.Fragment = y),
		(n.createRef = function () {
			return { current: null };
		}),
		(n.isValidElement = u),
		(n.Component = p),
		(n.cloneElement = function (n, l, u) {
			var i,
				t,
				o,
				f = arguments,
				r = s({}, n.props);
			for (o in l)
				"key" == o ? (i = l[o]) : "ref" == o ? (t = l[o]) : (r[o] = l[o]);
			if (arguments.length > 3)
				for (u = [u], o = 3; o < arguments.length; o++) u.push(f[o]);
			return (
				null != u && (r.children = u),
				h(n.type, r, i || n.key, t || n.ref, null)
			);
		}),
		(n.createContext = function (n, l) {
			var u = {
				__c: (l = "__cC" + f++),
				__: n,
				Consumer: function (n, l) {
					return n.children(l);
				},
				Provider: function (n) {
					var u, i;
					return (
						this.getChildContext ||
							((u = []),
							((i = {})[l] = this),
							(this.getChildContext = function () {
								return i;
							}),
							(this.shouldComponentUpdate = function (n) {
								this.props.value !== n.value && u.some(k);
							}),
							(this.sub = function (n) {
								u.push(n);
								var l = n.componentWillUnmount;
								n.componentWillUnmount = function () {
									u.splice(u.indexOf(n), 1), l && l.call(n);
								};
							})),
						n.children
					);
				},
			};
			return (u.Provider.__ = u.Consumer.contextType = u);
		}),
		(n.toChildArray = function n(l, u) {
			return (
				(u = u || []),
				null == l ||
					"boolean" == typeof l ||
					(Array.isArray(l)
						? l.some(function (l) {
								n(l, u);
						  })
						: u.push(l)),
				u
			);
		}),
		(n.options = l);
});
//# sourceMappingURL=preact.umd.js.map
