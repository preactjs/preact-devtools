import { Component as n, Fragment as e, options as t } from 'preact';
var o = {};
function r(n) {
	return n.type === e
		? 'Wrapper'
		: 'function' == typeof n.type
		? 'Composite'
		: 'string' == typeof n.type
		? 'Native'
		: 'Text';
}
function i(n) {
	return n.type === e
		? 'Fragment'
		: 'function' == typeof n.type
		? n.type.displayName || n.type.name
		: 'string' == typeof n.type
		? n.type
		: '#text';
}
function a(n, e, t) {
	var o = e.pop(),
		r = e.reduce(function(n, e) {
			return n ? n[e] : null;
		}, n);
	r && (r[o] = t);
}
function s(e) {
	var t = e.__c,
		o = null;
	null != t &&
		t instanceof n &&
		(o = {
			setState: t.setState.bind(t),
			forceUpdate: t.forceUpdate.bind(t),
			setInState: function(n, e) {
				t.setState(function(t) {
					return a(t, n, e), t;
				});
			},
			setInProps: function(n, o) {
				a(e.props, n, o), t.setState({});
			},
			setInContext: function(n, e) {
				a(t.context, n, e), t.setState({});
			}
		});
	var s = l(e),
		u = e.endTime - e.startTime;
	return {
		nodeType: r(e),
		type: e.type,
		name: i(e),
		ref: e.ref || null,
		key: e.key || null,
		updater: o,
		text: null === e.type ? e.props : null,
		state: null != t && t instanceof n ? t.state : null,
		props: e.props,
		children:
			null !== e.type
				? null != s && 1 == s.length && null === s[0].type
					? s[0].props
					: s
				: null,
		publicInstance: c(e),
		memoizedInteractions: [],
		actualDuration: u,
		actualStartTime: e.startTime,
		treeBaseDuration: u
	};
}
function l(n) {
	return null == n.__c
		? null != n.__k
			? n.__k.filter(Boolean)
			: []
		: null != n.__k
		? n.__k.filter(Boolean)
		: null;
}
function u(n) {
	return n.type === e && null === n.__;
}
function c(n) {
	return u(n)
		? n.__k.length > 0 && null != n.__k[0] && null != n.__k[0].__e
			? n.__k[0].__e.parentNode
			: n
		: null != n.__c
		? n.__c
		: n.type === e
		? n.props
		: n.__e;
}
function f(n, e, t) {
	if (null == n || null == e) return !1;
	for (var o in n)
		if ((!t || 'children' != o || null == e[o]) && n[o] !== e[o]) return !1;
	return Object.keys(n).length === Object.keys(e).length;
}
var d = 'function' == typeof WeakMap,
	h = n.prototype.setState;
n.prototype.setState = function(n, e) {
	return (
		null == this.__v
			? console.warn(
					'Calling "this.setState" inside the constructor of a component is a no-op and might be a bug in your application. Instead, set "this.state = {}" directly.'
			  )
			: null == this.__P &&
			  console.warn(
					'Can\'t call "this.setState" on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.'
			  ),
		h.call(this, n, e)
	);
};
var p = n.prototype.forceUpdate;
function v(n) {
	var e = n.props,
		t = i(n),
		o = '';
	for (var r in e)
		if (e.hasOwnProperty(r) && 'children' !== r) {
			var a = e[r];
			'function' == typeof a &&
				(a = 'function ' + (a.displayName || a.name) + '() {}'),
				(a =
					Object(a) !== a || a.toString
						? a + ''
						: Object.prototype.toString.call(a)),
				(o += ' ' + r + '=' + JSON.stringify(a));
		}
	var s = e.children;
	return '<' + t + o + (s && s.length ? '>..</' + t + '>' : ' />');
}
n.prototype.forceUpdate = function(n) {
	return (
		null == this.__v
			? console.warn(
					'Calling "this.forceUpdate" inside the constructor of a component is a no-op and might be a bug in your application.'
			  )
			: null == this.__P &&
			  console.warn(
					'Can\'t call "this.setState" on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.'
			  ),
		p.call(this, n)
	);
};
var y = (function() {
	function n(n, e) {
		(this.rid = e),
			(this.hook = n),
			(this.pending = []),
			(this.inst2vnode = new WeakMap()),
			(this.connected = !1);
	}
	var e = n.prototype;
	return (
		(e.markConnected = function() {
			(this.connected = !0), this.flushPendingEvents();
		}),
		(e.flushPendingEvents = function() {
			if (this.connected) {
				var n = this.pending;
				this.pending = [];
				for (var e = 0; e < n.length; e++) {
					var t = n[e];
					this.hook.emit(t.type, t);
				}
			}
		}),
		(e.mount = function(n) {
			this.inst2vnode.set(c(n), n);
			var e = s(n),
				t = [
					{ internalInstance: n, data: e, renderer: this.rid, type: 'mount' }
				];
			if (Array.isArray(e.children))
				for (var o, r = e.children.slice(); null != (o = r.pop()); ) {
					var i = l(o);
					r.push.apply(r, i), this.inst2vnode.set(c(o), o);
					var a = s(o);
					t.push({
						internalInstance: o,
						data: a,
						renderer: this.rid,
						type: 'mount'
					});
				}
			for (var f = t.length; --f >= 0; ) this.pending.push(t[f]);
			u(n) &&
				this.pending.push({
					internalInstance: n,
					data: e,
					renderer: this.rid,
					type: 'root'
				});
		}),
		(e.update = function(n) {
			var e = s(n);
			if (Array.isArray(e.children))
				for (var t = 0; t < e.children.length; t++) {
					var o = e.children[t],
						r = c(o);
					null == this.inst2vnode.get(r) ? this.mount(o) : this.update(o),
						(e.children[t] = this.inst2vnode.get(r));
				}
			var i = this.inst2vnode.get(e.publicInstance);
			!(function(n, e) {
				return (
					(n.props !== e.props && !f(n.props, e.props, !0)) ||
					(null != n.__c && !f(e.__c.__u, e.__c.state)) ||
					n.__e !== e.__e ||
					n.ref !== e.ref
				);
			})(i, n)
				? this.pending.push({
						internalInstance: i,
						data: e,
						renderer: this.rid,
						type: 'updateProfileTimes'
				  })
				: this.pending.push({
						internalInstance: i,
						data: e,
						renderer: this.rid,
						type: 'update'
				  });
		}),
		(e.handleCommitFiberRoot = function(n) {
			var e = c(n);
			this.inst2vnode.has(e) ? this.update(n) : this.mount(n);
			var t = null;
			if (u(n)) (n.treeBaseDuration = 0), (t = n);
			else for (t = n; null != t.__; ) t = t.__;
			return (
				this.pending.push({
					internalInstance: t,
					renderer: this.rid,
					data: s(t),
					type: 'rootCommitted'
				}),
				this.flushPendingEvents(),
				n
			);
		}),
		(e.handleCommitFiberUnmount = function(n) {
			var e = c(n);
			this.inst2vnode.delete(e),
				this.pending.push({
					internalInstance: n,
					renderer: this.rid,
					type: 'unmount'
				});
		}),
		(e.getNativeFromReactElement = function(n) {
			return n.__e;
		}),
		(e.getReactElementFromNative = function(n) {
			return this.inst2vnode.get(n) || null;
		}),
		(e.walkTree = function() {}),
		(e.cleanup = function() {}),
		n
	);
})();
function m(n) {
	return function() {
		try {
			return n.apply(void 0, arguments);
		} catch (n) {
			console.error('The react devtools encountered an error'),
				console.error(n);
		}
	};
}
var b = function() {},
	w = Date.now;
try {
	w = performance.now.bind(performance);
} catch (n) {}
'development' === process.env.NODE_ENV &&
	((function() {
		var n = t.__b,
			e = t.diffed,
			r = t.vnode,
			a = t.__e,
			s = t.__,
			l = t.__h,
			u = d
				? {
						useEffect: new WeakMap(),
						useLayoutEffect: new WeakMap(),
						lazyPropTypes: new WeakMap()
				  }
				: null;
		(t.__e = function(n, e, t) {
			if (e && e.__c && 'function' == typeof n.then) {
				var o = n;
				n = new Error('Missing Suspense. The throwing component was: ' + i(e));
				for (var r = e; r; r = r.__)
					if (r.__c && r.__c.t) {
						n = o;
						break;
					}
				if (n instanceof Error) throw n;
			}
			a(n, e, t);
		}),
			(t.__ = function(n, e) {
				if (!e)
					throw new Error(
						'Undefined parent passed to render(), this is the second argument.\nCheck if the element is available in the DOM/has the correct id.'
					);
				var t;
				switch (e.nodeType) {
					case 1:
					case 11:
					case 9:
						t = !0;
						break;
					default:
						t = !1;
				}
				if (!t) {
					var o = i(n);
					throw new Error(
						'Expected a valid HTML node as a second argument to render.\tReceived ' +
							e +
							' instead: render(<' +
							o +
							' />, ' +
							e +
							');'
					);
				}
				s && s(n, e);
			}),
			(t.__b = function(e) {
				var t,
					r,
					a,
					s,
					l = e.type,
					c = (function n(e) {
						return e ? ('function' == typeof e.type ? n(e.__) : e) : {};
					})(e.__);
				if (void 0 === l)
					throw new Error(
						'Undefined component passed to createElement()\n\nYou likely forgot to export your component or might have mixed up default and named imports' +
							v(e)
					);
				if (null != l && 'object' == typeof l) {
					if (void 0 !== l.o && void 0 !== l.__e)
						throw new Error(
							'Invalid type passed to createElement(): ' +
								l +
								'\n\nDid you accidentally pass a JSX literal as JSX twice?\n\n  let My' +
								i(e) +
								' = ' +
								v(l) +
								';\n  let vnode = <My' +
								i(e) +
								' />;\n\nThis usually happens when you export a JSX literal and not the component.'
						);
					throw new Error(
						'Invalid type passed to createElement(): ' +
							(Array.isArray(l) ? 'array' : l)
					);
				}
				if (
					(('thead' !== l && 'tfoot' !== l && 'tbody' !== l) ||
					'table' === c.type
						? 'tr' === l &&
						  'thead' !== c.type &&
						  'tfoot' !== c.type &&
						  'tbody' !== c.type &&
						  'table' !== c.type
							? console.error(
									'Improper nesting of table. Your <tr> should have a <thead/tbody/tfoot/table> parent.' +
										v(e)
							  )
							: 'td' === l && 'tr' !== c.type
							? console.error(
									'Improper nesting of table. Your <td> should have a <tr> parent.' +
										v(e)
							  )
							: 'th' === l &&
							  'tr' !== c.type &&
							  console.error(
									'Improper nesting of table. Your <th> should have a <tr>.' +
										v(e)
							  )
						: console.error(
								'Improper nesting of table. Your <thead/tbody/tfoot> should have a <table> parent.' +
									v(e)
						  ),
					void 0 !== e.ref &&
						'function' != typeof e.ref &&
						'object' != typeof e.ref &&
						!('$$typeof' in e))
				)
					throw new Error(
						'Component\'s "ref" property should be a function, or an object created by createRef(), but got [' +
							typeof e.ref +
							'] instead\n' +
							v(e)
					);
				if ('string' == typeof e.type)
					for (var f in e.props)
						if (
							'o' === f[0] &&
							'n' === f[1] &&
							'function' != typeof e.props[f] &&
							null != e.props[f]
						)
							throw new Error(
								'Component\'s "' +
									f +
									'" property should be a function, but got [' +
									typeof e.props[f] +
									'] instead\n' +
									v(e)
							);
				if ('function' == typeof e.type && e.type.propTypes) {
					if (
						'Lazy' === e.type.displayName &&
						u &&
						!u.lazyPropTypes.has(e.type)
					) {
						var d =
							'PropTypes are not supported on lazy(). Use propTypes on the wrapped component itself. ';
						try {
							var h = e.type();
							u.lazyPropTypes.set(e.type, !0),
								console.warn(d + 'Component wrapped in lazy() is ' + i(h));
						} catch (n) {
							console.warn(
								d +
									"We will log the wrapped component's name once it is loaded."
							);
						}
					}
					(t = e.type.propTypes),
						(r = e.props),
						(a = i(e)),
						(s = v(e)),
						Object.keys(t).forEach(function(n) {
							var e;
							try {
								e = t[n](
									r,
									n,
									s,
									a,
									null,
									'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED'
								);
							} catch (n) {
								e = n;
							}
							!e ||
								e.message in o ||
								((o[e.message] = !0),
								console.error('Failed ' + a + ' type: ' + e.message));
						});
				}
				n && n(e);
			}),
			(t.__h = function(n) {
				if (!n)
					throw new Error('Hook can only be invoked from render methods.');
				l && l(n);
			});
		var c = function(n, e) {
				return {
					get: function() {
						throw new Error('getting vnode.' + n + ' is deprecated, ' + e);
					},
					set: function() {
						throw new Error('setting vnode.' + n + ' is not allowed, ' + e);
					}
				};
			},
			f = {
				nodeName: c('nodeName', 'use vnode.type'),
				attributes: c('attributes', 'use vnode.props'),
				children: c('children', 'use vnode.props.children')
			};
		(t.vnode = function(n) {
			var e, t;
			n.props &&
				n.props.__source &&
				((e = n.props.__source), delete n.props.__source),
				n.props &&
					n.props.__self &&
					((t = n.props.__self), delete n.props.__self),
				(n.__self = t),
				(n.__source = e),
				Object.defineProperties(n, f),
				r && r(n);
		}),
			(t.diffed = function(n) {
				n.__k &&
					n.__k.forEach(function(n) {
						if (n && void 0 === n.type) {
							delete n.__, delete n.__b;
							var e = Object.keys(n).join(',');
							throw new Error(
								'Objects are not valid as a child. Encountered an object with the keys {' +
									e +
									'}.'
							);
						}
					});
				var t = n.__c;
				if (t && t.i) {
					var o = t.i;
					Array.isArray(o.s) &&
						o.s.forEach(function(e) {
							if (e.l && (!e.u || !Array.isArray(e.u))) {
								var t = i(n);
								console.warn(
									'In ' +
										t +
										' you are calling useMemo/useCallback without passing arguments.\nThis is a noop since it will not be able to memoize, it will execute it every render.'
								);
							}
						}),
						Array.isArray(o.h) &&
							o.h.forEach(function(e) {
								if (!Array.isArray(e.u) && u && !u.useEffect.has(n.type)) {
									u.useEffect.set(n.type, !0);
									var t = i(n);
									console.warn(
										'You should provide an array of arguments as the second argument to the "useEffect" hook.\n\nNot doing so will invoke this effect on every render.\n\nThis effect can be found in the render of ' +
											t +
											'.'
									);
								}
							}),
						t.__h.forEach(function(e) {
							if (
								e.p &&
								!Array.isArray(e.u) &&
								u &&
								!u.useLayoutEffect.has(n.type)
							) {
								u.useLayoutEffect.set(n.type, !0);
								var t = i(n);
								console.warn(
									'You should provide an array of arguments as the second argument to the "useLayoutEffect" hook.\n\nNot doing so will invoke this effect on every render.\n\nThis effect can be found in the render of ' +
										t +
										'.'
								);
							}
						});
				}
				if ((e && e(n), null != n.__k))
					for (var r = [], a = 0; a < n.__k.length; a++) {
						var s = n.__k[a];
						if (s && null != s.key) {
							var l = s.key;
							if (-1 !== r.indexOf(l)) {
								console.error(
									'Following component has two or more children with the same key attribute: "' +
										l +
										'". This may cause glitches and misbehavior in rendering process. Component: \n\n' +
										v(n)
								);
								break;
							}
							r.push(l);
						}
					}
			});
	})(),
	(function() {
		var o = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (null != o) {
			var r = b,
				i = b,
				a = Math.random()
					.toString(16)
					.slice(2),
				s = new y(o, a);
			m(function() {
				var n = !1;
				try {
					n = 'production' !== process.env.NODE_ENV;
				} catch (n) {}
				window.parent.postMessage(
					{
						source: 'react-devtools-detector',
						reactBuildType: n ? 'development' : 'production'
					},
					'*'
				);
				var t = {
					bundleType: n ? 1 : 0,
					version: '16.5.2',
					rendererPackageName: 'preact',
					findHostInstanceByFiber: function(n) {
						return n.__e;
					},
					findFiberByHostInstance: function(n) {
						return s.inst2vnode.get(n) || null;
					}
				};
				if (o._renderers) {
					(o._renderers[a] = t),
						Object.defineProperty(o.helpers, a, {
							get: function() {
								return s;
							},
							set: function() {
								s.connected || l.markConnected();
							}
						});
					var l = o.helpers[a];
					o.emit('renderer-attached', { id: a, renderer: t, helpers: l }),
						(r = m(function(n) {
							if (n.type !== e || 0 != n.__k.length) {
								var t = o.getFiberRoots(a);
								(n = l.handleCommitFiberRoot(n)), t.has(n) || t.add(n);
							}
						})),
						(i = m(function(n) {
							o.onCommitFiberUnmount(a, n);
						}));
				} else
					console.info(
						'Preact is not compatible with your version of react-devtools. We will address this in future releases.'
					);
			})();
			var l = t.vnode,
				u = t.__c,
				c = t.unmount,
				f = t.__b,
				d = t.diffed;
			(t.vnode = function(n) {
				(n.startTime = NaN),
					(n.endTime = NaN),
					(n.startTime = 0),
					(n.endTime = -1),
					l && l(n);
			}),
				(t.__b = function(n) {
					(n.startTime = w()), null != f && f(n);
				}),
				(t.diffed = function(n) {
					(n.endTime = w()), null != d && d(n);
				}),
				(t.__c = m(function(n, e) {
					null != u && u(n, e), null != n && r(n);
				})),
				(t.unmount = m(function(n) {
					null != c && c(n), i(n);
				}));
			var h = n.prototype.setState;
			n.prototype.setState = function(n, e) {
				var t =
					(this.__s !== this.state && this.__s) ||
					(this.__s = Object.assign({}, this.state));
				return (this.__u = Object.assign({}, t)), h.call(this, n, e);
			};
		}
	})());
//# sourceMappingURL=debug.module.js.map
