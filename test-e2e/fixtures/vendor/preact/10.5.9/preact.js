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
		r,
		e = {},
		c = [],
		s = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
	function a(n, l) {
		for (var u in l) n[u] = l[u];
		return n;
	}
	function v(n) {
		var l = n.parentNode;
		l && l.removeChild(n);
	}
	function h(n, l, u) {
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
		return y(n, r, i, t, null);
	}
	function y(n, u, i, t, o) {
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
	function p(n) {
		return n.children;
	}
	function d(n, l) {
		(this.props = n), (this.context = l);
	}
	function _(n, l) {
		if (null == l) return n.__ ? _(n.__, n.__.__k.indexOf(n) + 1) : null;
		for (var u; l < n.__k.length; l++)
			if (null != (u = n.__k[l]) && null != u.__e) return u.__e;
		return "function" == typeof n.type ? _(n) : null;
	}
	function w(n) {
		var l, u;
		if (null != (n = n.__) && null != n.__c) {
			for (n.__e = n.__c.base = null, l = 0; l < n.__k.length; l++)
				if (null != (u = n.__k[l]) && null != u.__e) {
					n.__e = n.__c.base = u.__e;
					break;
				}
			return w(n);
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
							((i = a({}, t)).__v = t.__v + 1),
							N(
								f,
								t,
								i,
								l.__n,
								void 0 !== f.ownerSVGElement,
								null != t.__h ? [o] : null,
								u,
								null == o ? _(t) : o,
								t.__h,
							),
							T(u, t),
							t.__e != o && w(t)));
				});
	}
	function g(n, l, u, i, t, o, f, r, s, a) {
		var h,
			d,
			w,
			k,
			m,
			g,
			A,
			P = (i && i.__k) || c,
			C = P.length;
		for (
			s == e && (s = null != f ? f[0] : C ? _(i, 0) : null), u.__k = [], h = 0;
			h < l.length;
			h++
		)
			if (
				null !=
				(k = u.__k[h] =
					null == (k = l[h]) || "boolean" == typeof k
						? null
						: "string" == typeof k || "number" == typeof k
						? y(null, k, null, null, k)
						: Array.isArray(k)
						? y(p, { children: k }, null, null, null)
						: k.__b > 0
						? y(k.type, k.props, k.key, null, k.__v)
						: k)
			) {
				if (
					((k.__ = u),
					(k.__b = u.__b + 1),
					null === (w = P[h]) || (w && k.key == w.key && k.type === w.type))
				)
					P[h] = void 0;
				else
					for (d = 0; d < C; d++) {
						if ((w = P[d]) && k.key == w.key && k.type === w.type) {
							P[d] = void 0;
							break;
						}
						w = null;
					}
				N(n, k, (w = w || e), t, o, f, r, s, a),
					(m = k.__e),
					(d = k.ref) &&
						w.ref != d &&
						(A || (A = []),
						w.ref && A.push(w.ref, null, k),
						A.push(d, k.__c || m, k)),
					null != m
						? (null == g && (g = m),
						  "function" == typeof k.type && null != k.__k && k.__k === w.__k
								? (k.__d = s = b(k, s, n))
								: (s = x(n, k, w, P, f, m, s)),
						  a || "option" !== u.type
								? "function" == typeof u.type && (u.__d = s)
								: (n.value = ""))
						: s && w.__e == s && s.parentNode != n && (s = _(w));
			}
		if (((u.__e = g), null != f && "function" != typeof u.type))
			for (h = f.length; h--; ) null != f[h] && v(f[h]);
		for (h = C; h--; )
			null != P[h] &&
				("function" == typeof u.type &&
					null != P[h].__e &&
					P[h].__e == u.__d &&
					(u.__d = _(i, h + 1)),
				I(P[h], P[h]));
		if (A) for (h = 0; h < A.length; h++) H(A[h], A[++h], A[++h]);
	}
	function b(n, l, u) {
		var i, t;
		for (i = 0; i < n.__k.length; i++)
			(t = n.__k[i]) &&
				((t.__ = n),
				(l =
					"function" == typeof t.type
						? b(t, l, u)
						: x(u, t, t, n.__k, null, t.__e, l)));
		return l;
	}
	function x(n, l, u, i, t, o, f) {
		var r, e, c;
		if (void 0 !== l.__d) (r = l.__d), (l.__d = void 0);
		else if (t == u || o != f || null == o.parentNode)
			n: if (null == f || f.parentNode !== n) n.appendChild(o), (r = null);
			else {
				for (e = f, c = 0; (e = e.nextSibling) && c < i.length; c += 2)
					if (e == o) break n;
				n.insertBefore(o, f), (r = f);
			}
		return void 0 !== r ? r : o.nextSibling;
	}
	function A(n, l, u, i, t) {
		var o;
		for (o in u)
			"children" === o || "key" === o || o in l || C(n, o, null, u[o], i);
		for (o in l)
			(t && "function" != typeof l[o]) ||
				"children" === o ||
				"key" === o ||
				"value" === o ||
				"checked" === o ||
				u[o] === l[o] ||
				C(n, o, l[o], u[o], i);
	}
	function P(n, l, u) {
		"-" === l[0]
			? n.setProperty(l, u)
			: (n[l] =
					null == u ? "" : "number" != typeof u || s.test(l) ? u : u + "px");
	}
	function C(n, l, u, i, t) {
		var o, f, r;
		if ((t && "className" == l && (l = "class"), "style" === l))
			if ("string" == typeof u) n.style.cssText = u;
			else {
				if (("string" == typeof i && (n.style.cssText = i = ""), i))
					for (l in i) (u && l in u) || P(n.style, l, "");
				if (u) for (l in u) (i && u[l] === i[l]) || P(n.style, l, u[l]);
			}
		else
			"o" === l[0] && "n" === l[1]
				? ((o = l !== (l = l.replace(/Capture$/, ""))),
				  (f = l.toLowerCase()) in n && (l = f),
				  (l = l.slice(2)),
				  n.l || (n.l = {}),
				  (n.l[l + o] = u),
				  (r = o ? z : j),
				  u ? i || n.addEventListener(l, r, o) : n.removeEventListener(l, r, o))
				: "list" !== l &&
				  "tagName" !== l &&
				  "form" !== l &&
				  "type" !== l &&
				  "size" !== l &&
				  "download" !== l &&
				  "href" !== l &&
				  !t &&
				  l in n
				? (n[l] = null == u ? "" : u)
				: "function" != typeof u &&
				  "dangerouslySetInnerHTML" !== l &&
				  (l !== (l = l.replace(/xlink:?/, ""))
						? null == u || !1 === u
							? n.removeAttributeNS(
									"http://www.w3.org/1999/xlink",
									l.toLowerCase(),
							  )
							: n.setAttributeNS(
									"http://www.w3.org/1999/xlink",
									l.toLowerCase(),
									u,
							  )
						: null == u || (!1 === u && !/^ar/.test(l))
						? n.removeAttribute(l)
						: n.setAttribute(l, u));
	}
	function j(n) {
		this.l[n.type + !1](l.event ? l.event(n) : n);
	}
	function z(n) {
		this.l[n.type + !0](l.event ? l.event(n) : n);
	}
	function N(n, u, i, t, o, f, r, e, c) {
		var s,
			v,
			h,
			y,
			_,
			w,
			k,
			m,
			b,
			x,
			A,
			P = u.type;
		if (void 0 !== u.constructor) return null;
		null != i.__h &&
			((c = i.__h), (e = u.__e = i.__e), (u.__h = null), (f = [e])),
			(s = l.__b) && s(u);
		try {
			n: if ("function" == typeof P) {
				if (
					((m = u.props),
					(b = (s = P.contextType) && t[s.__c]),
					(x = s ? (b ? b.props.value : s.__) : t),
					i.__c
						? (k = (v = u.__c = i.__c).__ = v.__E)
						: ("prototype" in P && P.prototype.render
								? (u.__c = v = new P(m, x))
								: ((u.__c = v = new d(m, x)),
								  (v.constructor = P),
								  (v.render = L)),
						  b && b.sub(v),
						  (v.props = m),
						  v.state || (v.state = {}),
						  (v.context = x),
						  (v.__n = t),
						  (h = v.__d = !0),
						  (v.__h = [])),
					null == v.__s && (v.__s = v.state),
					null != P.getDerivedStateFromProps &&
						(v.__s == v.state && (v.__s = a({}, v.__s)),
						a(v.__s, P.getDerivedStateFromProps(m, v.__s))),
					(y = v.props),
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
							m !== y &&
							null != v.componentWillReceiveProps &&
							v.componentWillReceiveProps(m, x),
						(!v.__e &&
							null != v.shouldComponentUpdate &&
							!1 === v.shouldComponentUpdate(m, v.__s, x)) ||
							u.__v === i.__v)
					) {
						(v.props = m),
							(v.state = v.__s),
							u.__v !== i.__v && (v.__d = !1),
							(v.__v = u),
							(u.__e = i.__e),
							(u.__k = i.__k),
							v.__h.length && r.push(v);
						break n;
					}
					null != v.componentWillUpdate && v.componentWillUpdate(m, v.__s, x),
						null != v.componentDidUpdate &&
							v.__h.push(function () {
								v.componentDidUpdate(y, _, w);
							});
				}
				(v.context = x),
					(v.props = m),
					(v.state = v.__s),
					(s = l.__r) && s(u),
					(v.__d = !1),
					(v.__v = u),
					(v.__P = n),
					(s = v.render(v.props, v.state, v.context)),
					(v.state = v.__s),
					null != v.getChildContext && (t = a(a({}, t), v.getChildContext())),
					h ||
						null == v.getSnapshotBeforeUpdate ||
						(w = v.getSnapshotBeforeUpdate(y, _)),
					(A =
						null != s && s.type === p && null == s.key ? s.props.children : s),
					g(n, Array.isArray(A) ? A : [A], u, i, t, o, f, r, e, c),
					(v.base = u.__e),
					(u.__h = null),
					v.__h.length && r.push(v),
					k && (v.__E = v.__ = null),
					(v.__e = !1);
			} else null == f && u.__v === i.__v ? ((u.__k = i.__k), (u.__e = i.__e)) : (u.__e = $(i.__e, u, i, t, o, f, r, c));
			(s = l.diffed) && s(u);
		} catch (n) {
			(u.__v = null),
				(c || null != f) &&
					((u.__e = e), (u.__h = !!c), (f[f.indexOf(e)] = null)),
				l.__e(n, u, i);
		}
	}
	function T(n, u) {
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
	function $(n, l, u, i, t, o, f, r) {
		var s,
			a,
			v,
			h,
			y,
			p = u.props,
			d = l.props;
		if (((t = "svg" === l.type || t), null != o))
			for (s = 0; s < o.length; s++)
				if (
					null != (a = o[s]) &&
					((null === l.type ? 3 === a.nodeType : a.localName === l.type) ||
						n == a)
				) {
					(n = a), (o[s] = null);
					break;
				}
		if (null == n) {
			if (null === l.type) return document.createTextNode(d);
			(n = t
				? document.createElementNS("http://www.w3.org/2000/svg", l.type)
				: document.createElement(l.type, d.is && { is: d.is })),
				(o = null),
				(r = !1);
		}
		if (null === l.type) p === d || (r && n.data === d) || (n.data = d);
		else {
			if (
				(null != o && (o = c.slice.call(n.childNodes)),
				(v = (p = u.props || e).dangerouslySetInnerHTML),
				(h = d.dangerouslySetInnerHTML),
				!r)
			) {
				if (null != o)
					for (p = {}, y = 0; y < n.attributes.length; y++)
						p[n.attributes[y].name] = n.attributes[y].value;
				(h || v) &&
					((h && ((v && h.__html == v.__html) || h.__html === n.innerHTML)) ||
						(n.innerHTML = (h && h.__html) || ""));
			}
			A(n, d, p, t, r),
				h
					? (l.__k = [])
					: ((s = l.props.children),
					  g(
							n,
							Array.isArray(s) ? s : [s],
							l,
							u,
							i,
							"foreignObject" !== l.type && t,
							o,
							f,
							e,
							r,
					  )),
				r ||
					("value" in d &&
						void 0 !== (s = d.value) &&
						(s !== n.value || ("progress" === l.type && !s)) &&
						C(n, "value", s, p.value, !1),
					"checked" in d &&
						void 0 !== (s = d.checked) &&
						s !== n.checked &&
						C(n, "checked", s, p.checked, !1));
		}
		return n;
	}
	function H(n, u, i) {
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
			(t = n.ref) && ((t.current && t.current !== n.__e) || H(t, null, u)),
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
		null != o && v(o);
	}
	function L(n, l, u) {
		return this.constructor(n, u);
	}
	function M(n, u, i) {
		var t, o, r;
		l.__ && l.__(n, u),
			(o = (t = i === f) ? null : (i && i.__k) || u.__k),
			(n = h(p, null, [n])),
			(r = []),
			N(
				u,
				((t ? u : i || u).__k = n),
				o || e,
				e,
				void 0 !== u.ownerSVGElement,
				i && !t
					? [i]
					: o
					? null
					: u.childNodes.length
					? c.slice.call(u.childNodes)
					: null,
				r,
				i || e,
				t,
			),
			T(r, n);
	}
	(l = {
		__e: function (n, l) {
			for (var u, i, t, o = l.__h; (l = l.__); )
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
							return (l.__h = o), (u.__E = u);
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
		(d.prototype.setState = function (n, l) {
			var u;
			(u =
				null != this.__s && this.__s !== this.state
					? this.__s
					: (this.__s = a({}, this.state))),
				"function" == typeof n && (n = n(a({}, u), this.props)),
				n && a(u, n),
				null != n && this.__v && (l && this.__h.push(l), k(this));
		}),
		(d.prototype.forceUpdate = function (n) {
			this.__v && ((this.__e = !0), n && this.__h.push(n), k(this));
		}),
		(d.prototype.render = p),
		(i = []),
		(t =
			"function" == typeof Promise
				? Promise.prototype.then.bind(Promise.resolve())
				: setTimeout),
		(m.__r = 0),
		(f = e),
		(r = 0),
		(n.render = M),
		(n.hydrate = function (n, l) {
			M(n, l, f);
		}),
		(n.createElement = h),
		(n.h = h),
		(n.Fragment = p),
		(n.createRef = function () {
			return { current: null };
		}),
		(n.isValidElement = u),
		(n.Component = d),
		(n.cloneElement = function (n, l, u) {
			var i,
				t,
				o,
				f = arguments,
				r = a({}, n.props);
			for (o in l)
				"key" == o ? (i = l[o]) : "ref" == o ? (t = l[o]) : (r[o] = l[o]);
			if (arguments.length > 3)
				for (u = [u], o = 3; o < arguments.length; o++) u.push(f[o]);
			return (
				null != u && (r.children = u),
				y(n.type, r, i || n.key, t || n.ref, null)
			);
		}),
		(n.createContext = function (n, l) {
			var u = {
				__c: (l = "__cC" + r++),
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
