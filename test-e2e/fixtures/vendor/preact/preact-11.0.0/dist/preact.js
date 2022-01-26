var n,
	l,
	t,
	r,
	u,
	e,
	i,
	o,
	f,
	c,
	s,
	a,
	h = [];
function v(n, l) {
	null == n.__h && (n.__h = []), n.__h.push(l);
}
function y(l, t) {
	n.__c && n.__c(t, l),
		l.some((t) => {
			try {
				for (l = t.__h.length; l--; ) t.__h.shift()();
			} catch (l) {
				n.__e(l, t);
			}
		});
}
function p(n, l, t) {
	var r,
		u,
		e,
		i = {};
	for (e in l)
		'key' == e ? (r = l[e]) : 'ref' == e ? (u = l[e]) : (i[e] = l[e]);
	if (arguments.length > 3)
		for (t = [t], e = 3; arguments.length > e; e++) t.push(arguments[e]);
	return arguments.length > 2 && (i.children = t), d(n, i, r, u, 0);
}
function d(t, r, u, e, i) {
	var o = {
		type: t,
		props: r,
		key: u,
		ref: e,
		constructor: void 0,
		__v: i || ++l
	};
	return null != n.vnode && n.vnode(o), o;
}
function _(n) {
	return null == n || 'boolean' == typeof n
		? null
		: 'object' == typeof n
		? Array.isArray(n)
			? d(b, { children: n }, null, null, 0)
			: n
		: 'function' == typeof n
		? n
		: n + '';
}
function b(n) {
	return n.children;
}
function x(l, t, r, u) {
	if (l !== t) {
		l && x(null, l, null, u);
		try {
			'function' == typeof t ? t(r) : t && (t.current = r);
		} catch (l) {
			n.__e(l, u);
		}
	}
}
function k(n, l, t) {
	'-' === l[0] ? n.style.setProperty(l, t) : (n.style[l] = null == t ? '' : t);
}
function g(n, l, t, r, u) {
	var e;
	n: if ('style' === l)
		if ('string' == typeof t) k(n, 'cssText', t);
		else {
			if (('string' == typeof r && k(n, 'cssText', (r = '')), r))
				for (l in r) (t && l in t) || k(n, l, '');
			for (l in t) (r && t[l] === r[l]) || k(n, l, t[l]);
		}
	else if ('o' === l[0] && 'n' === l[1])
		(e = l !== (l = l.replace(/Capture$/, ''))),
			(l = l.toLowerCase() in n ? l.toLowerCase().slice(2) : l.slice(2)),
			n.l || (n.l = {}),
			(n.l[l + e] = t),
			t
				? r || n.addEventListener(l, e ? w : j, e)
				: n.removeEventListener(l, e ? w : j, e);
	else if ('dangerouslySetInnerHTML' !== l) {
		if (u) l = l.replace(/xlink[H:h]/, 'h').replace(/sName$/, 's');
		else if (
			'href' !== l &&
			'list' !== l &&
			'form' !== l &&
			'tabIndex' !== l &&
			'download' !== l &&
			l in n
		)
			try {
				n[l] = null == t ? '' : t;
				break n;
			} catch (n) {}
		'function' == typeof t ||
			(null != t && (!1 !== t || ('a' === l[0] && 'r' === l[1]))
				? n.setAttribute(l, t)
				: n.removeAttribute(l));
	}
}
function j(l) {
	this.l[l.type + !1](n.event ? n.event(l) : l),
		this.t &&
			(null == this.value ||
				('input' !== l.type && 'change' !== l.type) ||
				(this.value = this.u),
			null != this.checked && 'change' === l.type && (this.checked = this.u));
}
function w(l) {
	this.l[l.type + !0](n.event ? n.event(l) : l);
}
function O(l, t, r, u) {
	var e,
		i,
		o = t.type,
		f = l ? l.props : t.props;
	return (
		t && t.__c
			? (e = t.__c)
			: ((t.__c = e = {
					props: f,
					context: u,
					forceUpdate: t.rerender.bind(null, t)
			  }),
			  (t.flags |= 16384)),
		l && l.__v === t.__v
			? ((e.props = f), void (t.flags |= 32768))
			: ((e.context = u),
			  (t.props = e.props = f),
			  (i = n.__r) && i(t),
			  (t.flags &= -16385),
			  (e.__i = t),
			  (i = o.call(e, e.props, e.context)),
			  null != e.getChildContext &&
					(t.c = Object.assign({}, r, e.getChildContext())),
			  i)
	);
}
function m(l, t, r, u) {
	var e,
		i,
		o,
		f,
		c,
		s,
		a = t.type,
		h = l ? l.props : t.props;
	if (
		(t && t.__c
			? (e = t.__c)
			: ((t.__c = e = new a(h, u)),
			  e.state || (e.state = {}),
			  (i = !0),
			  (t.flags |= 16384)),
		null == e.__s && (e.__s = e.state),
		null != a.getDerivedStateFromProps &&
			(e.__s == e.state && (e.__s = Object.assign({}, e.__s)),
			Object.assign(e.__s, a.getDerivedStateFromProps(h, e.__s))),
		(o = e.props),
		(f = e.state),
		i)
	)
		null == a.getDerivedStateFromProps &&
			null != e.componentWillMount &&
			e.componentWillMount(),
			null != e.componentDidMount && v(t, e.componentDidMount.bind(e));
	else {
		if (
			(null == a.getDerivedStateFromProps &&
				h !== o &&
				null != e.componentWillReceiveProps &&
				e.componentWillReceiveProps(h, u),
			(!(8192 & t.flags) &&
				null != e.shouldComponentUpdate &&
				!1 === e.shouldComponentUpdate(h, e.__s, u)) ||
				(l && l.__v === t.__v))
		)
			return (e.props = h), (e.state = e.__s), void (t.flags |= 32768);
		null != e.componentWillUpdate && e.componentWillUpdate(h, e.__s, u);
	}
	return (
		(e.context = u),
		(t.props = e.props = h),
		(e.state = e.__s),
		(s = n.__r) && s(t),
		(t.flags &= -16385),
		(e.__i = t),
		(s = e.render(e.props, e.state, e.context)),
		(e.state = e.__s),
		null != e.getChildContext &&
			(t.c = Object.assign({}, r, e.getChildContext())),
		i ||
			(null != e.getSnapshotBeforeUpdate &&
				(c = e.getSnapshotBeforeUpdate(o, f)),
			null != e.componentDidUpdate &&
				v(t, () => {
					e.componentDidUpdate(o, f, c);
				})),
		s
	);
}
function A(l, t, r) {
	var u,
		i = 0;
	if (
		(n.unmount && n.unmount(l),
		(l.flags |= 2048),
		(u = l.ref) && ((u.current && u.current !== l.__e) || x(null, u, null, t)),
		(u = l.__c) && (e(l), u.componentWillUnmount))
	)
		try {
			u.componentWillUnmount();
		} catch (l) {
			n.__e(l, t);
		}
	if ((u = l.__k))
		for (; u.length > i; i++)
			u[i] && A(u[i], t, r ? 16 & ~l.flags : 3 & l.flags);
	!r && 3 & l.flags && l.__e.remove(), (l.__e = null);
}
function S(n, l, t, r) {
	var u,
		e,
		i,
		o,
		f,
		c,
		s,
		a,
		v,
		y,
		p,
		d = (t.__k && t.__k.slice()) || h,
		b = d.length,
		k = b,
		g = 0,
		j = [];
	for (u = 0; l.length > u; u++)
		if (null != (f = _(l[u]))) {
			(c = void 0),
				-1 === (a = T(f, d, (s = u + g), k))
					? (o = void 0)
					: ((o = d[a]), (d[a] = void 0), k--),
				(v = null == o)
					? B(n, f, (o = N(f, t)), r, $(t, s))
					: 160 == (160 & o.flags)
					? ((c = o.ref), B(n, f, o, r, o.__e))
					: ((c = o.ref), I(n, f, o, r)),
				(e = o.__e),
				(f.ref || c) &&
					(i || (i = []),
					(o.ref = f.ref),
					i.push(c, f.ref, (28 & o.flags && o.__c) || e, o));
			n: if (v)
				-1 == a && g--,
					3 & o.flags && ((y = $(t, s)), n.insertBefore(o.__e, y));
			else if (a !== s) {
				if (a === s + 1) {
					g++;
					break n;
				}
				if (a > s) {
					if (k > l.length - s) {
						g += a - s;
						break n;
					}
					g--;
				} else g = s > a && a == s - 1 ? a - s : 0;
				if (((s = u + g), a == u)) break n;
				(p = $(t, s + 1)), 3 & o.flags ? n.insertBefore(o.__e, p) : H(o, p, n);
			}
			j[u] = o;
		} else j[u] = null;
	if (((t.__k = j), k > 0)) for (u = b; u--; ) null != d[u] && A(d[u], d[u]);
	if (i) for (u = 0; i.length > u; u++) x(i[u], i[++u], i[++u], i[++u]);
}
function T(n, l, t, r) {
	var u = 'string' == typeof n ? null : n.type,
		e = null !== u ? n.key : void 0,
		i = -1,
		o = t - 1,
		f = t + 1,
		c = l[t];
	if (null === c || (null != c && c.type === u && c.key == e)) i = t;
	else if (r > (null != c ? 1 : 0))
		for (;;) {
			if (o >= 0) {
				if (null != (c = l[o]) && c.type === u && c.key == e) {
					i = o;
					break;
				}
				o--;
			}
			if (l.length > f) {
				if (null != (c = l[f]) && c.type === u && c.key == e) {
					i = f;
					break;
				}
				f++;
			} else if (0 > o) break;
		}
	return i;
}
function H(n, l, t) {
	var r, u;
	if (null != n.__k)
		for (r = 0; n.__k.length > r; r++)
			(u = n.__k[r]) &&
				((u.__ = n),
				28 & u.flags ? H(u, l, t) : u.__e != l && t.insertBefore(u.__e, l));
}
function I(l, t, r, u) {
	var e,
		i,
		o,
		f,
		c,
		s,
		a,
		h,
		v = r.__e,
		y = r.flags;
	if (1 & y) t !== r.props && ((v.data = t), (r.props = t));
	else {
		if (void 0 !== t.constructor) return null;
		n.__b && n.__b(r, t),
			2 & y &&
				(t.__v !== r.__v && (P(v, t, r, u), (r.__v = t.__v)),
				n.diffed && n.diffed(r),
				(r.flags &= -42465)),
			(i = l),
			16 & y &&
				((l = t.props.__P),
				r.props.__P !== t.props.__P && H(r, l == i ? $(r) : null, l));
		try {
			512 & r.flags && (r.flags ^= 1536),
				(o = q(r)),
				(c = (f = t.type.contextType) && o[f.__c]),
				(s = f ? (c ? c.props.value : f.__) : o),
				(a = !r || !r.__c),
				(e = 4 & r.flags ? m(t, r, o, s) : O(t, r, o, s)),
				32768 & r.flags
					? ((r.props = t.props),
					  (r.flags &= -32769),
					  t && t.__v !== r.__v && (r.flags &= -16385))
					: ((h =
							null != e && e.type === b && null == e.key
								? e.props.children
								: e),
					  null == r.__k
							? E(
									l,
									Array.isArray(h) ? h : [h],
									r,
									u,
									160 == (160 & r.flags)
										? r.__e
										: a || 32 & r.flags
										? null
										: $(r)
							  )
							: S(l, Array.isArray(h) ? h : [h], r, u)),
				null != r.__h && r.__h.length && u.push(r);
		} catch (l) {
			(r.flags |= l.then ? 128 : 256), n.__e(l, r);
		}
		n.diffed && n.diffed(r), (r.flags &= -42465), (r.__v = t.__v);
	}
}
function P(n, l, t, r) {
	var u,
		e,
		i,
		o,
		f,
		c,
		s = t.props,
		a = (t.props = l.props),
		h = 4096 & t.flags;
	for (u in s)
		(e = s[u]),
			'key' === u ||
				'children' === u ||
				('dangerouslySetInnerHTML' === u
					? (f = e)
					: u in a || g(n, u, null, e, h));
	for (u in a)
		(e = a[u]),
			'key' === u ||
				('children' === u
					? (c = e)
					: 'dangerouslySetInnerHTML' === u
					? (o = e)
					: (e === (i = s[u]) &&
							(('checked' !== u && 'value' !== u) ||
								null == e ||
								e === n[u])) ||
					  g(n, u, e, i, h));
	o
		? ((e = o.__html),
		  (!f || (e !== f.__html && e !== n.innerHTML)) && (n.innerHTML = e),
		  (t.__k = null))
		: (f && (n.innerHTML = ''), S(n, c && Array.isArray(c) ? c : [c], t, r)),
		null != a.value && n.t
			? (n.u = a.value)
			: null != a.checked && n.t && (n.u = a.checked);
}
function L(n, l) {
	(this.props = n), (this.context = l);
}
function M(l) {
	((16384 & l.flags || !(l.flags |= 16384) || !o.push(l) || C.__r++) &&
		f === n.debounceRendering) ||
		((f = n.debounceRendering) || c)(C);
}
function C() {
	for (; (s = C.__r = o.length); )
		for (o.sort((n, l) => n.__b - l.__b); s--; )
			(l = void 0),
				2048 & ~(n = o.shift()).flags &&
					16384 & n.flags &&
					(I(z(n), d(n.type, n.props, n.key, n.ref, 0), n, (l = [])), y(l, n));
	var n, l;
}
function N(l, t) {
	var r,
		u,
		e,
		i,
		o = null,
		f = t ? 4192 & t.flags : 0,
		c = NaN;
	return (
		'string' == typeof l
			? ((f |= 1), (r = l))
			: void 0 !== l.constructor
			? ((f |= 1), (r = ''))
			: ((r = l.props || {}),
			  (u = l.key),
			  (e = l.ref),
			  (c = l.__v),
			  2 &
					(f |=
						'function' == typeof (o = l.type)
							? o.prototype && 'render' in o.prototype
								? 4
								: r.__P
								? 16
								: 8
							: 2) && 'svg' === o
					? (f |= 4096)
					: t && 4096 & t.flags && 'foreignObject' === t.type && (f &= -4097)),
		(i = {
			type: o,
			props: r,
			key: u,
			ref: e,
			data: 'function' == typeof o ? {} : null,
			rerender: M,
			flags: f,
			__k: null,
			__: t,
			__v: c,
			__e: null,
			__c: null,
			c: null,
			__b: t ? t.__b + 1 : 0
		}),
		n.__i && n.__i(i, l),
		i
	);
}
function $(n, l) {
	return null == l
		? $(n.__, n.__.__k.indexOf(n) + 1)
		: U(n, l) || (n.__ && a(n) ? $(n) : null);
}
function U(n, l) {
	var t, r;
	if (null == n.__k) return null;
	for (l = l || 0; n.__k.length > l; l++)
		if (null != (t = n.__k[l])) {
			if (3 & t.flags) return t.__e;
			if (a(t) && (r = U(t))) return r;
		}
	return null;
}
function q(n) {
	for (var l = n.c, t = n.__; null == l && t; ) (l = t.c), (t = t.__);
	return l;
}
function z(n) {
	for (var l = 16 & n.flags ? n.props.__P : null, t = n.__; null == l && t; )
		16 & t.flags ? (l = t.props.__P) : 2 & t.flags && (l = t.__e), (t = t.__);
	return l;
}
function B(l, t, r, u, e) {
	var i, o, f, c, s, a, h, v;
	n.__b && n.__b(r, t);
	try {
		28 & r.flags
			? ((o = e),
			  (f = l),
			  16 & r.flags && (l = t.props.__P) !== f && (e = null),
			  (c = q(r)),
			  (a = (s = t.type.contextType) && c[s.__c]),
			  (h = s ? (a ? a.props.value : s.__) : c),
			  a && a.s.add(r),
			  (i = 4 & r.flags ? m(null, r, c, h) : O(null, r, c, h)),
			  (i = E(
					l,
					Array.isArray(
						(v =
							null != i && i.type === b && null == i.key ? i.props.children : i)
					)
						? v
						: [v],
					r,
					u,
					e
			  )),
			  null != r.__h && r.__h.length && u.push(r),
			  16 & r.flags && f !== l && (i = o))
			: (i = D(96 & r.flags ? e : null, r, u)),
			n.diffed && n.diffed(r),
			(r.flags &= -42465);
	} catch (l) {
		(r.__v = 0),
			(r.flags |= l.then ? 128 : 256),
			32 & r.flags && ((i = e && e.nextSibling), (r.__e = e)),
			n.__e(l, r);
	}
	return i;
}
function D(n, l, t) {
	var r,
		u,
		e,
		i,
		o,
		f,
		c = l.props,
		s = l.type,
		a = l.flags,
		h = 4096 & a,
		v = 32 & ~a;
	if (96 & a)
		for (; n && (s ? n.localName !== s : 3 !== n.nodeType); ) n = n.nextSibling;
	if (((e = null == n), 1 & a))
		e ? (n = document.createTextNode(c)) : n.data !== c && (n.data = c),
			(l.__e = n);
	else {
		if (
			(e &&
				((n = h
					? document.createElementNS('http://www.w3.org/2000/svg', s)
					: document.createElement(s, c.is && c)),
				(l.flags = a &= -42465),
				(v = 1)),
			64 & a)
		)
			for (r = 0; n.attributes.length > r; r++)
				(u = n.attributes[r].name) in c || n.removeAttribute(u);
		for (r in (('input' !== l.type &&
			'textarea' !== l.type &&
			'select' !== l.type) ||
			(!c.onInput && !c.onChange) ||
			(null != c.value
				? ((n.t = !0), (n.u = c.value))
				: null != c.checked && ((n.t = !0), (n.u = c.checked))),
		c))
			(u = c[r]),
				'key' === r ||
					('children' === r
						? (f = u)
						: 'dangerouslySetInnerHTML' === r
						? (i = u)
						: 'value' === r
						? (o = u)
						: null == u ||
						  (!v && 'function' != typeof u) ||
						  g(n, r, u, null, h));
		(l.__e = n),
			i
				? (v && i.__html && (n.innerHTML = i.__html), (l.__k = null))
				: null != f &&
				  E(n, f && Array.isArray(f) ? f : [f], l, t, e ? null : n.firstChild),
			v && null != o && g(n, 'value', o, null, 0);
	}
	return e ? null : n.nextSibling;
}
function E(n, l, t, r, u) {
	var e,
		i,
		o,
		f,
		c,
		s = (t.__k = []);
	for (e = 0; l.length > e; e++)
		null != (i = _(l[e]))
			? ((o = N(i, t)),
			  (s[e] = o),
			  (c = B(n, i, o, r, u)),
			  (f = o.__e),
			  28 & o.flags || f == u ? (u = c) : null != f && n.insertBefore(f, u),
			  o.ref && x(null, o.ref, o.__c || f, o))
			: (s[e] = null);
	if (96 & t.flags && 2 & t.flags)
		for (; u; ) (e = u), (u = u.nextSibling), e.remove();
	return u;
}
function F(l) {
	var t,
		r,
		u,
		e = 0;
	function i(i) {
		n.__ && n.__(i, l),
			(i = p(b, { __P: l }, [i])),
			(u = l.firstChild),
			(r = []),
			t
				? I(l, i, t, r)
				: ((t = N(i)),
				  (l.__k = t),
				  u && (e = e || 64),
				  void 0 !== l.ownerSVGElement && (e |= 4096),
				  (t.flags |= e),
				  (t.c = {}),
				  B(l, i, t, r, u)),
			y(r, t);
	}
	return {
		hydrate(n) {
			(e |= 32), i(n);
		},
		render: i
	};
}
function G(n) {
	return n.children;
}
(n = {
	__e: function (n, l) {
		for (; (l = l.__); )
			if (28 & l.flags && 1024 & ~l.flags)
				try {
					if (
						(l.type.getDerivedStateFromError &&
							l.__c.setState(l.type.getDerivedStateFromError(n)),
						l.__c.componentDidCatch && l.__c.componentDidCatch(n),
						16384 & l.flags)
					)
						return void (l.flags |= 512);
				} catch (l) {
					n = l;
				}
		throw n;
	}
}),
	(l = 0),
	(t = (n) => null != n && void 0 === n.constructor),
	(r = 0),
	(u = new Set()),
	(e = (n) => {
		u.delete(n) ||
			u.forEach((l) => {
				l.__c.s.delete(n);
			});
	}),
	(i = (n, l) => {
		var t = {
			__c: (l = '__cC' + r++),
			__: n,
			Consumer: (n, l) => n.children(l),
			Provider(n, t) {
				return (
					this.s
						? n.value !== this.p && this.s.forEach(M)
						: ((this.s = new Set()),
						  ((t = {})[l] = this),
						  (this.getChildContext = () => t),
						  u.add(this.__i)),
					(this.p = n.value),
					n.children
				);
			}
		};
		return (t.Provider.__ = t.Consumer.contextType = t);
	}),
	(L.prototype.setState = function (n, l) {
		var t;
		(t =
			null != this.__s && this.__s !== this.state
				? this.__s
				: (this.__s = Object.assign({}, this.state))),
			'function' == typeof n && (n = n(Object.assign({}, t), this.props)),
			n && Object.assign(t, n),
			null != n &&
				this.__i &&
				(l && v(this.__i, l.bind(this)), this.__i.rerender(this.__i));
	}),
	(L.prototype.forceUpdate = function (n) {
		this.__i &&
			((this.__i.flags |= 8192),
			n && v(this.__i, n.bind(this)),
			this.__i.rerender(this.__i));
	}),
	(L.prototype.render = b),
	(o = []),
	(c = Promise.prototype.then.bind(Promise.resolve())),
	(s = C.__r = 0),
	(a = (n) => 28 & n.flags && (!(16 & n.flags) || n.props.__P == z(n.__))),
	(exports.Component = L),
	(exports.Fragment = b),
	(exports.cloneElement = function (n, l, t) {
		var r,
			u,
			e,
			i = Object.assign({}, n.props);
		for (e in l)
			'key' == e ? (r = l[e]) : 'ref' == e ? (u = l[e]) : (i[e] = l[e]);
		if (arguments.length > 3)
			for (t = [t], e = 3; arguments.length > e; e++) t.push(arguments[e]);
		return (
			arguments.length > 2 && (i.children = t),
			d(n.type, i, r || n.key, u || n.ref, 0)
		);
	}),
	(exports.createContext = i),
	(exports.createElement = p),
	(exports.createPortal = function (n, l) {
		return p(G, { __P: l }, n);
	}),
	(exports.createRef = function () {
		return { current: null };
	}),
	(exports.createRoot = F),
	(exports.h = p),
	(exports.hydrate = function (n, l) {
		var t = l && l.__;
		t || (t = F(l)), t.hydrate(n), (l.__ = t);
	}),
	(exports.isValidElement = t),
	(exports.options = n),
	(exports.render = function (n, l) {
		var t = l && l.__;
		t || (t = F(l)), t.render(n), (l.__ = t);
	}),
	(exports.toChildArray = function n(l, t) {
		if (((t = t || []), null == l || 'boolean' == typeof l));
		else if (Array.isArray(l)) for (l of l) n(l, t);
		else t.push(l);
		return t;
	});
//# sourceMappingURL=preact.js.map
