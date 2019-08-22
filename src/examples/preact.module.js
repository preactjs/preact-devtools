var n,
	l,
	u,
	t,
	i,
	r,
	o,
	f = {},
	e = [],
	c = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|^--/i;
function s(n, l) {
	for (var u in l) n[u] = l[u];
	return n;
}
function a(n) {
	var l = n.parentNode;
	l && l.removeChild(n);
}
function h(n, l, u) {
	var t,
		i,
		r,
		o,
		f = arguments;
	if (((l = s({}, l)), arguments.length > 3))
		for (u = [u], t = 3; t < arguments.length; t++) u.push(f[t]);
	if ((null != u && (l.children = u), null != n && null != n.defaultProps))
		for (i in n.defaultProps) void 0 === l[i] && (l[i] = n.defaultProps[i]);
	return (
		(o = l.key),
		null != (r = l.ref) && delete l.ref,
		null != o && delete l.key,
		v(n, l, o, r)
	);
}
function v(l, u, t, i) {
	var r = {
		type: l,
		props: u,
		key: t,
		ref: i,
		__k: null,
		__p: null,
		__b: 0,
		__e: null,
		__z: null,
		__c: null,
		constructor: void 0,
	};
	return n.vnode && n.vnode(r), r;
}
function p() {
	return {};
}
function y(n) {
	return n.children;
}
function d(n) {
	if (null == n || "boolean" == typeof n) return null;
	if ("string" == typeof n || "number" == typeof n)
		return v(null, n, null, null);
	if (null != n.__e || null != n.__c) {
		var l = v(n.type, n.props, n.key, null);
		return (l.__e = n.__e), l;
	}
	return n;
}
function m(n, l) {
	(this.props = n), (this.context = l);
}
function w(n, l) {
	if (null == l) return n.__p ? w(n.__p, n.__p.__k.indexOf(n) + 1) : null;
	for (var u; l < n.__k.length; l++)
		if (null != (u = n.__k[l]) && null != u.__e) return u.__e;
	return "function" == typeof n.type ? w(n) : null;
}
function g(n) {
	var l, u;
	if (null != (n = n.__p) && null != n.__c) {
		for (n.__e = n.__c.base = null, l = 0; l < n.__k.length; l++)
			if (null != (u = n.__k[l]) && null != u.__e) {
				n.__e = n.__c.base = u.__e;
				break;
			}
		return g(n);
	}
}
function k(l) {
	((!l.__d && (l.__d = !0) && 1 === u.push(l)) || i !== n.debounceRendering) &&
		((i = n.debounceRendering), (n.debounceRendering || t)(_));
}
function _() {
	var n;
	for (
		u.sort(function(n, l) {
			return l.__v.__b - n.__v.__b;
		});
		(n = u.pop());

	)
		n.__d && n.forceUpdate(!1);
}
function b(n, l, u, t, i, r, o, c, s) {
	var h,
		v,
		p,
		y,
		m,
		g,
		k,
		_,
		b = l.__k || x(l.props.children, (l.__k = []), d, !0),
		C = (u && u.__k) || e,
		P = C.length;
	for (
		c == f && (c = null != r ? r[0] : P ? w(u, 0) : null), v = 0;
		v < b.length;
		v++
	)
		if (null != (h = b[v] = d(b[v]))) {
			if (
				((h.__p = l),
				(h.__b = l.__b + 1),
				null === (y = C[v]) || (y && h.key == y.key && h.type === y.type))
			)
				C[v] = void 0;
			else
				for (p = 0; p < P; p++) {
					if ((y = C[p]) && h.key == y.key && h.type === y.type) {
						C[p] = void 0;
						break;
					}
					y = null;
				}
			if (
				((m = $(n, h, (y = y || f), t, i, r, o, null, c, s)),
				(p = h.ref) && y.ref != p && (_ || (_ = [])).push(p, h.__c || m, h),
				null != m)
			) {
				if ((null == k && (k = m), null != h.__z)) (m = h.__z), (h.__z = null);
				else if (r == y || m != c || null == m.parentNode) {
					n: if (null == c || c.parentNode !== n) n.appendChild(m);
					else {
						for (g = c, p = 0; (g = g.nextSibling) && p < P; p += 2)
							if (g == m) break n;
						n.insertBefore(m, c);
					}
					"option" == l.type && (n.value = "");
				}
				(c = m.nextSibling), "function" == typeof l.type && (l.__z = m);
			}
		}
	if (((l.__e = k), null != r && "function" != typeof l.type))
		for (v = r.length; v--; ) null != r[v] && a(r[v]);
	for (v = P; v--; ) null != C[v] && D(C[v], C[v]);
	if (_) for (v = 0; v < _.length; v++) A(_[v], _[++v], _[++v]);
}
function x(n, l, u, t) {
	if ((null == l && (l = []), null == n || "boolean" == typeof n))
		t && l.push(null);
	else if (Array.isArray(n))
		for (var i = 0; i < n.length; i++) x(n[i], l, u, t);
	else l.push(u ? u(n) : n);
	return l;
}
function C(n, l, u, t, i) {
	var r;
	for (r in u) r in l || N(n, r, null, u[r], t);
	for (r in l)
		(i && "function" != typeof l[r]) ||
			"value" === r ||
			"checked" === r ||
			u[r] === l[r] ||
			N(n, r, l[r], u[r], t);
}
function P(n, l, u) {
	"-" === l[0]
		? n.setProperty(l, u)
		: (n[l] = "number" == typeof u && !1 === c.test(l) ? u + "px" : u || "");
}
function N(n, l, u, t, i) {
	var r, o, f, e, c;
	if (
		"key" ===
			(l = i
				? "className" === l
					? "class"
					: l
				: "class" === l
				? "className"
				: l) ||
		"children" === l
	);
	else if ("style" === l)
		if (((r = n.style), "string" == typeof u)) r.cssText = u;
		else {
			if (("string" == typeof t && ((r.cssText = ""), (t = null)), t))
				for (o in t) (u && o in u) || P(r, o, "");
			if (u) for (f in u) (t && u[f] === t[f]) || P(r, f, u[f]);
		}
	else
		"o" === l[0] && "n" === l[1]
			? ((e = l !== (l = l.replace(/Capture$/, ""))),
			  (c = l.toLowerCase()),
			  (l = (c in n ? c : l).slice(2)),
			  u
					? (t || n.addEventListener(l, T, e), ((n.l || (n.l = {}))[l] = u))
					: n.removeEventListener(l, T, e))
			: "list" !== l && "tagName" !== l && "form" !== l && !i && l in n
			? (n[l] = null == u ? "" : u)
			: "function" != typeof u &&
			  "dangerouslySetInnerHTML" !== l &&
			  (l !== (l = l.replace(/^xlink:?/, ""))
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
					: null == u || !1 === u
					? n.removeAttribute(l)
					: n.setAttribute(l, u));
}
function T(l) {
	return this.l[l.type](n.event ? n.event(l) : l);
}
function $(l, u, t, i, r, o, f, e, c, a) {
	var h,
		v,
		p,
		w,
		g,
		k,
		_,
		C,
		P,
		N,
		T = u.type;
	if (void 0 !== u.constructor) return null;
	(h = n.__b) && h(u);
	try {
		n: if ("function" == typeof T) {
			if (
				((C = u.props),
				(P = (h = T.contextType) && i[h.__c]),
				(N = h ? (P ? P.props.value : h.__p) : i),
				t.__c
					? (_ = (v = u.__c = t.__c).__p = v.__E)
					: ("prototype" in T && T.prototype.render
							? (u.__c = v = new T(C, N))
							: ((u.__c = v = new m(C, N)),
							  (v.constructor = T),
							  (v.render = H)),
					  P && P.sub(v),
					  (v.props = C),
					  v.state || (v.state = {}),
					  (v.context = N),
					  (v.__n = i),
					  (p = v.__d = !0),
					  (v.__h = [])),
				null == v.__s && (v.__s = v.state),
				null != T.getDerivedStateFromProps &&
					s(
						v.__s == v.state ? (v.__s = s({}, v.__s)) : v.__s,
						T.getDerivedStateFromProps(C, v.__s),
					),
				p)
			)
				null == T.getDerivedStateFromProps &&
					null != v.componentWillMount &&
					v.componentWillMount(),
					null != v.componentDidMount && f.push(v);
			else {
				if (
					(null == T.getDerivedStateFromProps &&
						null == e &&
						null != v.componentWillReceiveProps &&
						v.componentWillReceiveProps(C, N),
					!e &&
						null != v.shouldComponentUpdate &&
						!1 === v.shouldComponentUpdate(C, v.__s, N))
				) {
					(v.props = C),
						(v.state = v.__s),
						(v.__d = !1),
						(v.__v = u),
						(u.__e = null != c ? t.__e : null),
						(u.__k = t.__k);
					break n;
				}
				null != v.componentWillUpdate && v.componentWillUpdate(C, v.__s, N);
			}
			for (
				w = v.props,
					g = v.state,
					v.context = N,
					v.props = C,
					v.state = v.__s,
					(h = n.__r) && h(u),
					v.__d = !1,
					v.__v = u,
					v.__P = l,
					x(
						null != (h = v.render(v.props, v.state, v.context)) &&
							h.type == y &&
							null == h.key
							? h.props.children
							: h,
						(u.__k = []),
						d,
						!0,
					),
					null != v.getChildContext && (i = s(s({}, i), v.getChildContext())),
					p ||
						null == v.getSnapshotBeforeUpdate ||
						(k = v.getSnapshotBeforeUpdate(w, g)),
					b(l, u, t, i, r, o, f, c, a),
					v.base = u.__e;
				(h = v.__h.pop());

			)
				h.call(v);
			p ||
				null == w ||
				null == v.componentDidUpdate ||
				v.componentDidUpdate(w, g, k),
				_ && (v.__E = v.__p = null);
		} else u.__e = z(t.__e, u, t, i, r, o, f, a);
		(h = n.diffed) && h(u, t);
	} catch (l) {
		n.__e(l, u, t);
	}
	return u.__e;
}
function j(l, u) {
	for (var t; (t = l.pop()); )
		try {
			t.componentDidMount();
		} catch (l) {
			n.__e(l, t.__v);
		}
	n.__c && n.__c(u);
}
function z(n, l, u, t, i, r, o, c) {
	var s,
		a,
		h,
		v,
		p = u.props,
		y = l.props;
	if (((i = "svg" === l.type || i), null == n && null != r))
		for (s = 0; s < r.length; s++)
			if (
				null != (a = r[s]) &&
				(null === l.type ? 3 === a.nodeType : a.localName === l.type)
			) {
				(n = a), (r[s] = null);
				break;
			}
	if (null == n) {
		if (null === l.type) return document.createTextNode(y);
		(n = i
			? document.createElementNS("http://www.w3.org/2000/svg", l.type)
			: document.createElement(l.type)),
			(r = null);
	}
	return (
		null === l.type
			? p !== y && (n.data = y)
			: l !== u &&
			  (null != r && (r = e.slice.call(n.childNodes)),
			  (h = (p = u.props || f).dangerouslySetInnerHTML),
			  (v = y.dangerouslySetInnerHTML),
			  c ||
					((v || h) &&
						((v && h && v.__html == h.__html) ||
							(n.innerHTML = (v && v.__html) || ""))),
			  C(n, y, p, i, c),
			  v || b(n, l, u, t, "foreignObject" !== l.type && i, r, o, f, c),
			  c ||
					("value" in y &&
						void 0 !== y.value &&
						y.value !== n.value &&
						(n.value = null == y.value ? "" : y.value),
					"checked" in y &&
						void 0 !== y.checked &&
						y.checked !== n.checked &&
						(n.checked = y.checked))),
		n
	);
}
function A(l, u, t) {
	try {
		"function" == typeof l ? l(u) : (l.current = u);
	} catch (l) {
		n.__e(l, t);
	}
}
function D(l, u, t) {
	var i, r, o;
	if (
		((i = l.ref) && A(i, null, u),
		t || "function" == typeof l.type || (t = null != (r = l.__e)),
		(l.__e = l.__z = null),
		null != (i = l.__c))
	) {
		if (i.componentWillUnmount)
			try {
				i.componentWillUnmount();
			} catch (l) {
				n.__e(l, u);
			}
		i.base = i.__P = null;
	}
	if ((i = l.__k)) for (o = 0; o < i.length; o++) i[o] && D(i[o], u, t);
	n.unmount && n.unmount(l), null != r && a(r);
}
function H(n, l, u) {
	return this.constructor(n, u);
}
function I(l, u, t) {
	var i, o, c;
	n.__p && n.__p(l, u),
		(o = (i = t === r) ? null : (t && t.__k) || u.__k),
		(l = h(y, null, [l])),
		(c = []),
		$(
			u,
			i ? (u.__k = l) : ((t || u).__k = l),
			o || f,
			f,
			void 0 !== u.ownerSVGElement,
			t && !i ? [t] : o ? null : e.slice.call(u.childNodes),
			c,
			!1,
			t || f,
			i,
		),
		(l.__e = u),
		j(c, l);
}
function L(n, l) {
	I(n, l, r);
}
function M(n, l) {
	return (
		(l = s(s({}, n.props), l)),
		arguments.length > 2 && (l.children = e.slice.call(arguments, 2)),
		v(n.type, l, l.key || n.key, l.ref || n.ref)
	);
}
function O(n) {
	var l = {},
		u = {
			__c: "__cC" + o++,
			__p: n,
			Consumer: function(n, l) {
				return n.children(l);
			},
			Provider: function(n) {
				var t,
					i = this;
				return (
					this.getChildContext ||
						((t = []),
						(this.getChildContext = function() {
							return (l[u.__c] = i), l;
						}),
						(this.shouldComponentUpdate = function(n) {
							t.some(function(l) {
								l.__P && ((l.context = n.value), k(l));
							});
						}),
						(this.sub = function(n) {
							t.push(n);
							var l = n.componentWillUnmount;
							n.componentWillUnmount = function() {
								t.splice(t.indexOf(n), 1), l && l.call(n);
							};
						})),
					n.children
				);
			},
		};
	return (u.Consumer.contextType = u), u;
}
(n = {}),
	(l = function(n) {
		return null != n && void 0 === n.constructor;
	}),
	(m.prototype.setState = function(n, l) {
		var u =
			(this.__s !== this.state && this.__s) || (this.__s = s({}, this.state));
		("function" != typeof n || (n = n(u, this.props))) && s(u, n),
			null != n && this.__v && (l && this.__h.push(l), k(this));
	}),
	(m.prototype.forceUpdate = function(n) {
		var l,
			u,
			t,
			i = this.__v,
			r = this.__v.__e,
			o = this.__P;
		o &&
			((l = !1 !== n),
			(u = []),
			(t = $(
				o,
				i,
				s({}, i),
				this.__n,
				void 0 !== o.ownerSVGElement,
				null,
				u,
				l,
				null == r ? w(i) : r,
			)),
			j(u, i),
			t != r && g(i)),
			n && n();
	}),
	(m.prototype.render = y),
	(u = []),
	(t =
		"function" == typeof Promise
			? Promise.prototype.then.bind(Promise.resolve())
			: setTimeout),
	(i = n.debounceRendering),
	(n.__e = function(n, l, u) {
		for (var t; (l = l.__p); )
			if ((t = l.__c) && !t.__p)
				try {
					if (t.constructor && null != t.constructor.getDerivedStateFromError)
						t.setState(t.constructor.getDerivedStateFromError(n));
					else {
						if (null == t.componentDidCatch) continue;
						t.componentDidCatch(n);
					}
					return k((t.__E = t));
				} catch (l) {
					n = l;
				}
		throw n;
	}),
	(r = f),
	(o = 0);
export {
	I as render,
	L as hydrate,
	h as createElement,
	h,
	y as Fragment,
	p as createRef,
	l as isValidElement,
	m as Component,
	M as cloneElement,
	O as createContext,
	x as toChildArray,
	D as _unmount,
	n as options,
};
//# sourceMappingURL=preact.module.js.map
