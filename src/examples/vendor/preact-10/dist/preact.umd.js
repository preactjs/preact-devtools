!(function(n, l) {
	'object' == typeof exports && 'undefined' != typeof module
		? l(exports)
		: 'function' == typeof define && define.amd
		? define(['exports'], l)
		: l((n.preact = {}));
})(this, function(n) {
	var l,
		u,
		t,
		i,
		o,
		f,
		r,
		e = {},
		c = [],
		s = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
	function a(n, l) {
		for (var u in l) n[u] = l[u];
		return n;
	}
	function h(n) {
		var l = n.parentNode;
		l && l.removeChild(n);
	}
	function p(n, l, u) {
		var t,
			i,
			o,
			f,
			r = arguments;
		if (((l = a({}, l)), arguments.length > 3))
			for (u = [u], t = 3; t < arguments.length; t++) u.push(r[t]);
		if ((null != u && (l.children = u), null != n && null != n.defaultProps))
			for (i in n.defaultProps) void 0 === l[i] && (l[i] = n.defaultProps[i]);
		return (
			(f = l.key),
			null != (o = l.ref) && delete l.ref,
			null != f && delete l.key,
			v(n, l, f, o)
		);
	}
	function v(n, u, t, i) {
		var o = {
			type: n,
			props: u,
			key: t,
			ref: i,
			__k: null,
			__: null,
			__b: 0,
			__e: null,
			__d: null,
			__c: null,
			constructor: void 0
		};
		return l.vnode && l.vnode(o), o;
	}
	function d(n) {
		return n.children;
	}
	function y(n, l) {
		(this.props = n), (this.context = l);
	}
	function m(n, l) {
		if (null == l) return n.__ ? m(n.__, n.__.__k.indexOf(n) + 1) : null;
		for (var u; l < n.__k.length; l++)
			if (null != (u = n.__k[l]) && null != u.__e) return u.__e;
		return 'function' == typeof n.type ? m(n) : null;
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
	function g(n) {
		((!n.__d && (n.__d = !0) && 1 === t.push(n)) ||
			o !== l.debounceRendering) &&
			((o = l.debounceRendering) || i)(k);
	}
	function k() {
		var n, l, u, i, o, f, r;
		for (
			t.sort(function(n, l) {
				return l.__v.__b - n.__v.__b;
			});
			(n = t.pop());

		)
			n.__d &&
				((u = void 0),
				(i = void 0),
				(f = (o = (l = n).__v).__e),
				(r = l.__P) &&
					((u = []),
					(i = j(
						r,
						o,
						a({}, o),
						l.__n,
						void 0 !== r.ownerSVGElement,
						null,
						u,
						null == f ? m(o) : f
					)),
					T(u, o),
					i != f && w(o)));
	}
	function _(n, l, u, t, i, o, f, r, s) {
		var a,
			p,
			v,
			d,
			y,
			w,
			g,
			k = (u && u.__k) || c,
			_ = k.length;
		if (
			(r == e && (r = null != o ? o[0] : _ ? m(u, 0) : null),
			(a = 0),
			(l.__k = b(l.__k, function(u) {
				if (null != u) {
					if (
						((u.__ = l),
						(u.__b = l.__b + 1),
						null === (v = k[a]) || (v && u.key == v.key && u.type === v.type))
					)
						k[a] = void 0;
					else
						for (p = 0; p < _; p++) {
							if ((v = k[p]) && u.key == v.key && u.type === v.type) {
								k[p] = void 0;
								break;
							}
							v = null;
						}
					if (
						((d = j(n, u, (v = v || e), t, i, o, f, r, s)),
						(p = u.ref) &&
							v.ref != p &&
							(g || (g = []),
							v.ref && g.push(v.ref, null, u),
							g.push(p, u.__c || d, u)),
						null != d)
					) {
						if ((null == w && (w = d), null != u.__d))
							(d = u.__d), (u.__d = null);
						else if (o == v || d != r || null == d.parentNode) {
							n: if (null == r || r.parentNode !== n) n.appendChild(d);
							else {
								for (y = r, p = 0; (y = y.nextSibling) && p < _; p += 2)
									if (y == d) break n;
								n.insertBefore(d, r);
							}
							'option' == l.type && (n.value = '');
						}
						(r = d.nextSibling), 'function' == typeof l.type && (l.__d = d);
					}
				}
				return a++, u;
			})),
			(l.__e = w),
			null != o && 'function' != typeof l.type)
		)
			for (a = o.length; a--; ) null != o[a] && h(o[a]);
		for (a = _; a--; ) null != k[a] && A(k[a], k[a]);
		if (g) for (a = 0; a < g.length; a++) z(g[a], g[++a], g[++a]);
	}
	function b(n, l, u) {
		if ((null == u && (u = []), null == n || 'boolean' == typeof n))
			l && u.push(l(null));
		else if (Array.isArray(n)) for (var t = 0; t < n.length; t++) b(n[t], l, u);
		else
			u.push(
				l
					? l(
							'string' == typeof n || 'number' == typeof n
								? v(null, n, null, null)
								: null != n.__e || null != n.__c
								? v(n.type, n.props, n.key, null)
								: n
					  )
					: n
			);
		return u;
	}
	function x(n, l, u, t, i) {
		var o;
		for (o in u) o in l || P(n, o, null, u[o], t);
		for (o in l)
			(i && 'function' != typeof l[o]) ||
				'value' === o ||
				'checked' === o ||
				u[o] === l[o] ||
				P(n, o, l[o], u[o], t);
	}
	function C(n, l, u) {
		'-' === l[0]
			? n.setProperty(l, u)
			: (n[l] =
					'number' == typeof u && !1 === s.test(l)
						? u + 'px'
						: null == u
						? ''
						: u);
	}
	function P(n, l, u, t, i) {
		var o, f, r, e, c;
		if (
			(i
				? 'className' === l && (l = 'class')
				: 'class' === l && (l = 'className'),
			'key' === l || 'children' === l)
		);
		else if ('style' === l)
			if (((o = n.style), 'string' == typeof u)) o.cssText = u;
			else {
				if (('string' == typeof t && ((o.cssText = ''), (t = null)), t))
					for (f in t) (u && f in u) || C(o, f, '');
				if (u) for (r in u) (t && u[r] === t[r]) || C(o, r, u[r]);
			}
		else
			'o' === l[0] && 'n' === l[1]
				? ((e = l !== (l = l.replace(/Capture$/, ''))),
				  (c = l.toLowerCase()),
				  (l = (c in n ? c : l).slice(2)),
				  u
						? (t || n.addEventListener(l, N, e), ((n.l || (n.l = {}))[l] = u))
						: n.removeEventListener(l, N, e))
				: 'list' !== l && 'tagName' !== l && 'form' !== l && !i && l in n
				? (n[l] = null == u ? '' : u)
				: 'function' != typeof u &&
				  'dangerouslySetInnerHTML' !== l &&
				  (l !== (l = l.replace(/^xlink:?/, ''))
						? null == u || !1 === u
							? n.removeAttributeNS(
									'http://www.w3.org/1999/xlink',
									l.toLowerCase()
							  )
							: n.setAttributeNS(
									'http://www.w3.org/1999/xlink',
									l.toLowerCase(),
									u
							  )
						: null == u || !1 === u
						? n.removeAttribute(l)
						: n.setAttribute(l, u));
	}
	function N(n) {
		this.l[n.type](l.event ? l.event(n) : n);
	}
	function j(n, u, t, i, o, f, r, e, c) {
		var s,
			h,
			p,
			v,
			m,
			w,
			g,
			k,
			x,
			C,
			P = u.type;
		if (void 0 !== u.constructor) return null;
		(s = l.__b) && s(u);
		try {
			n: if ('function' == typeof P) {
				if (
					((k = u.props),
					(x = (s = P.contextType) && i[s.__c]),
					(C = s ? (x ? x.props.value : s.__) : i),
					t.__c
						? (g = (h = u.__c = t.__c).__ = h.__E)
						: ('prototype' in P && P.prototype.render
								? (u.__c = h = new P(k, C))
								: ((u.__c = h = new y(k, C)),
								  (h.constructor = P),
								  (h.render = D)),
						  x && x.sub(h),
						  (h.props = k),
						  h.state || (h.state = {}),
						  (h.context = C),
						  (h.__n = i),
						  (p = h.__d = !0),
						  (h.__h = [])),
					null == h.__s && (h.__s = h.state),
					null != P.getDerivedStateFromProps &&
						(h.__s == h.state && (h.__s = a({}, h.__s)),
						a(h.__s, P.getDerivedStateFromProps(k, h.__s))),
					(v = h.props),
					(m = h.state),
					p)
				)
					null == P.getDerivedStateFromProps &&
						null != h.componentWillMount &&
						h.componentWillMount(),
						null != h.componentDidMount && h.__h.push(h.componentDidMount);
				else {
					if (
						(null == P.getDerivedStateFromProps &&
							null == h.__e &&
							null != h.componentWillReceiveProps &&
							h.componentWillReceiveProps(k, C),
						!h.__e &&
							null != h.shouldComponentUpdate &&
							!1 === h.shouldComponentUpdate(k, h.__s, C))
					) {
						for (
							h.props = k,
								h.state = h.__s,
								h.__d = !1,
								h.__v = u,
								u.__e = t.__e,
								u.__k = t.__k,
								h.__h.length && r.push(h),
								s = 0;
							s < u.__k.length;
							s++
						)
							u.__k[s] && (u.__k[s].__ = u);
						break n;
					}
					null != h.componentWillUpdate && h.componentWillUpdate(k, h.__s, C),
						null != h.componentDidUpdate &&
							h.__h.push(function() {
								h.componentDidUpdate(v, m, w);
							});
				}
				(h.context = C),
					(h.props = k),
					(h.state = h.__s),
					(s = l.__r) && s(u),
					(h.__d = !1),
					(h.__v = u),
					(h.__P = n),
					(s = h.render(h.props, h.state, h.context)),
					(u.__k = b(
						null != s && s.type == d && null == s.key ? s.props.children : s
					)),
					null != h.getChildContext && (i = a(a({}, i), h.getChildContext())),
					p ||
						null == h.getSnapshotBeforeUpdate ||
						(w = h.getSnapshotBeforeUpdate(v, m)),
					_(n, u, t, i, o, f, r, e, c),
					(h.base = u.__e),
					h.__h.length && r.push(h),
					g && (h.__E = h.__ = null),
					(h.__e = null);
			} else u.__e = $(t.__e, u, t, i, o, f, r, c);
			(s = l.diffed) && s(u);
		} catch (n) {
			l.__e(n, u, t);
		}
		return u.__e;
	}
	function T(n, u) {
		l.__c && l.__c(u, n),
			n.some(function(u) {
				try {
					(n = u.__h),
						(u.__h = []),
						n.some(function(n) {
							n.call(u);
						});
				} catch (n) {
					l.__e(n, u.__v);
				}
			});
	}
	function $(n, l, u, t, i, o, f, r) {
		var s,
			a,
			h,
			p,
			v,
			d = u.props,
			y = l.props;
		if (((i = 'svg' === l.type || i), null == n && null != o))
			for (s = 0; s < o.length; s++)
				if (
					null != (a = o[s]) &&
					(null === l.type ? 3 === a.nodeType : a.localName === l.type)
				) {
					(n = a), (o[s] = null);
					break;
				}
		if (null == n) {
			if (null === l.type) return document.createTextNode(y);
			(n = i
				? document.createElementNS('http://www.w3.org/2000/svg', l.type)
				: document.createElement(l.type)),
				(o = null);
		}
		if (null === l.type)
			null != o && (o[o.indexOf(n)] = null), d !== y && (n.data = y);
		else if (l !== u) {
			if (
				(null != o && (o = c.slice.call(n.childNodes)),
				(h = (d = u.props || e).dangerouslySetInnerHTML),
				(p = y.dangerouslySetInnerHTML),
				!r)
			) {
				if (d === e)
					for (d = {}, v = 0; v < n.attributes.length; v++)
						d[n.attributes[v].name] = n.attributes[v].value;
				(p || h) &&
					((p && h && p.__html == h.__html) ||
						(n.innerHTML = (p && p.__html) || ''));
			}
			x(n, y, d, i, r),
				(l.__k = l.props.children),
				p || _(n, l, u, t, 'foreignObject' !== l.type && i, o, f, e, r),
				r ||
					('value' in y &&
						void 0 !== y.value &&
						y.value !== n.value &&
						(n.value = null == y.value ? '' : y.value),
					'checked' in y &&
						void 0 !== y.checked &&
						y.checked !== n.checked &&
						(n.checked = y.checked));
		}
		return n;
	}
	function z(n, u, t) {
		try {
			'function' == typeof n ? n(u) : (n.current = u);
		} catch (n) {
			l.__e(n, t);
		}
	}
	function A(n, u, t) {
		var i, o, f;
		if (
			(l.unmount && l.unmount(n),
			(i = n.ref) && z(i, null, u),
			t || 'function' == typeof n.type || (t = null != (o = n.__e)),
			(n.__e = n.__d = null),
			null != (i = n.__c))
		) {
			if (i.componentWillUnmount)
				try {
					i.componentWillUnmount();
				} catch (n) {
					l.__e(n, u);
				}
			i.base = i.__P = null;
		}
		if ((i = n.__k)) for (f = 0; f < i.length; f++) i[f] && A(i[f], u, t);
		null != o && h(o);
	}
	function D(n, l, u) {
		return this.constructor(n, u);
	}
	function E(n, u, t) {
		var i, o, r;
		l.__ && l.__(n, u),
			(o = (i = t === f) ? null : (t && t.__k) || u.__k),
			(n = p(d, null, [n])),
			(r = []),
			j(
				u,
				((i ? u : t || u).__k = n),
				o || e,
				e,
				void 0 !== u.ownerSVGElement,
				t && !i ? [t] : o ? null : c.slice.call(u.childNodes),
				r,
				t || e,
				i
			),
			T(r, n);
	}
	(l = {
		__e: function(n, l) {
			for (var u; (l = l.__); )
				if ((u = l.__c) && !u.__)
					try {
						if (u.constructor && null != u.constructor.getDerivedStateFromError)
							u.setState(u.constructor.getDerivedStateFromError(n));
						else {
							if (null == u.componentDidCatch) continue;
							u.componentDidCatch(n);
						}
						return g((u.__E = u));
					} catch (l) {
						n = l;
					}
			throw n;
		}
	}),
		(u = function(n) {
			return null != n && void 0 === n.constructor;
		}),
		(y.prototype.setState = function(n, l) {
			var u;
			(u = this.__s !== this.state ? this.__s : (this.__s = a({}, this.state))),
				'function' == typeof n && (n = n(u, this.props)),
				n && a(u, n),
				null != n &&
					this.__v &&
					((this.__e = !1), l && this.__h.push(l), g(this));
		}),
		(y.prototype.forceUpdate = function(n) {
			this.__v && ((this.__e = !0), n && this.__h.push(n), g(this));
		}),
		(y.prototype.render = d),
		(t = []),
		(i =
			'function' == typeof Promise
				? Promise.prototype.then.bind(Promise.resolve())
				: setTimeout),
		(f = e),
		(r = 0),
		(n.render = E),
		(n.hydrate = function(n, l) {
			E(n, l, f);
		}),
		(n.createElement = p),
		(n.h = p),
		(n.Fragment = d),
		(n.createRef = function() {
			return {};
		}),
		(n.isValidElement = u),
		(n.Component = y),
		(n.cloneElement = function(n, l) {
			return (
				(l = a(a({}, n.props), l)),
				arguments.length > 2 && (l.children = c.slice.call(arguments, 2)),
				v(n.type, l, l.key || n.key, l.ref || n.ref)
			);
		}),
		(n.createContext = function(n) {
			var l = {},
				u = {
					__c: '__cC' + r++,
					__: n,
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
								(this.shouldComponentUpdate = function(l) {
									n.value !== l.value &&
										t.some(function(n) {
											(n.context = l.value), g(n);
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
					}
				};
			return (u.Consumer.contextType = u), u;
		}),
		(n.toChildArray = b),
		(n._e = A),
		(n.options = l);
});
//# sourceMappingURL=preact.umd.js.map
