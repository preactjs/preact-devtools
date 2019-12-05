!(function(n, e) {
	'object' == typeof exports && 'undefined' != typeof module
		? e(require('preact'))
		: 'function' == typeof define && define.amd
		? define(['preact'], e)
		: e(n.preact);
})(this, function(n) {
	var e = {};
	function t(e) {
		return e.type === n.Fragment
			? 'Wrapper'
			: 'function' == typeof e.type
			? 'Composite'
			: 'string' == typeof e.type
			? 'Native'
			: 'Text';
	}
	function o(e) {
		return e.type === n.Fragment
			? 'Fragment'
			: 'function' == typeof e.type
			? e.type.displayName || e.type.name
			: 'string' == typeof e.type
			? e.type
			: '#text';
	}
	function r(n, e, t) {
		var o = e.pop(),
			r = e.reduce(function(n, e) {
				return n ? n[e] : null;
			}, n);
		r && (r[o] = t);
	}
	function i(e) {
		var i = e.__c,
			s = null;
		null != i &&
			i instanceof n.Component &&
			(s = {
				setState: i.setState.bind(i),
				forceUpdate: i.forceUpdate.bind(i),
				setInState: function(n, e) {
					i.setState(function(t) {
						return r(t, n, e), t;
					});
				},
				setInProps: function(n, t) {
					r(e.props, n, t), i.setState({});
				},
				setInContext: function(n, e) {
					r(i.context, n, e), i.setState({});
				}
			});
		var l = a(e),
			c = e.endTime - e.startTime;
		return {
			nodeType: t(e),
			type: e.type,
			name: o(e),
			ref: e.ref || null,
			key: e.key || null,
			updater: s,
			text: null === e.type ? e.props : null,
			state: null != i && i instanceof n.Component ? i.state : null,
			props: e.props,
			children:
				null !== e.type
					? null != l && 1 == l.length && null === l[0].type
						? l[0].props
						: l
					: null,
			publicInstance: u(e),
			memoizedInteractions: [],
			actualDuration: c,
			actualStartTime: e.startTime,
			treeBaseDuration: c
		};
	}
	function a(n) {
		return null == n.__c
			? null != n.__k
				? n.__k.filter(Boolean)
				: []
			: null != n.__k
			? n.__k.filter(Boolean)
			: null;
	}
	function s(e) {
		return e.type === n.Fragment && null === e.__;
	}
	function u(e) {
		return s(e)
			? e.__k.length > 0 && null != e.__k[0] && null != e.__k[0].__e
				? e.__k[0].__e.parentNode
				: e
			: null != e.__c
			? e.__c
			: e.type === n.Fragment
			? e.props
			: e.__e;
	}
	function l(n, e, t) {
		if (null == n || null == e) return !1;
		for (var o in n)
			if ((!t || 'children' != o || null == e[o]) && n[o] !== e[o]) return !1;
		return Object.keys(n).length === Object.keys(e).length;
	}
	var c = 'function' == typeof WeakMap,
		f = n.Component.prototype.setState;
	n.Component.prototype.setState = function(n, e) {
		return (
			null == this.__v
				? console.warn(
						'Calling "this.setState" inside the constructor of a component is a no-op and might be a bug in your application. Instead, set "this.state = {}" directly.'
				  )
				: null == this.__P &&
				  console.warn(
						'Can\'t call "this.setState" on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.'
				  ),
			f.call(this, n, e)
		);
	};
	var d = n.Component.prototype.forceUpdate;
	function h(n) {
		var e = n.props,
			t = o(n),
			r = '';
		for (var i in e)
			if (e.hasOwnProperty(i) && 'children' !== i) {
				var a = e[i];
				'function' == typeof a &&
					(a = 'function ' + (a.displayName || a.name) + '() {}'),
					(a =
						Object(a) !== a || a.toString
							? a + ''
							: Object.prototype.toString.call(a)),
					(r += ' ' + i + '=' + JSON.stringify(a));
			}
		var s = e.children;
		return '<' + t + r + (s && s.length ? '>..</' + t + '>' : ' />');
	}
	n.Component.prototype.forceUpdate = function(n) {
		return (
			null == this.__v
				? console.warn(
						'Calling "this.forceUpdate" inside the constructor of a component is a no-op and might be a bug in your application.'
				  )
				: null == this.__P &&
				  console.warn(
						'Can\'t call "this.setState" on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.'
				  ),
			d.call(this, n)
		);
	};
	var p = (function() {
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
				this.inst2vnode.set(u(n), n);
				var e = i(n),
					t = [
						{ internalInstance: n, data: e, renderer: this.rid, type: 'mount' }
					];
				if (Array.isArray(e.children))
					for (var o, r = e.children.slice(); null != (o = r.pop()); ) {
						var l = a(o);
						r.push.apply(r, l), this.inst2vnode.set(u(o), o);
						var c = i(o);
						t.push({
							internalInstance: o,
							data: c,
							renderer: this.rid,
							type: 'mount'
						});
					}
				for (var f = t.length; --f >= 0; ) this.pending.push(t[f]);
				s(n) &&
					this.pending.push({
						internalInstance: n,
						data: e,
						renderer: this.rid,
						type: 'root'
					});
			}),
			(e.update = function(n) {
				var e = i(n);
				if (Array.isArray(e.children))
					for (var t = 0; t < e.children.length; t++) {
						var o = e.children[t],
							r = u(o);
						null == this.inst2vnode.get(r) ? this.mount(o) : this.update(o),
							(e.children[t] = this.inst2vnode.get(r));
					}
				var a = this.inst2vnode.get(e.publicInstance);
				!(function(n, e) {
					return (
						(n.props !== e.props && !l(n.props, e.props, !0)) ||
						(null != n.__c && !l(e.__c.__u, e.__c.state)) ||
						n.__e !== e.__e ||
						n.ref !== e.ref
					);
				})(a, n)
					? this.pending.push({
							internalInstance: a,
							data: e,
							renderer: this.rid,
							type: 'updateProfileTimes'
					  })
					: this.pending.push({
							internalInstance: a,
							data: e,
							renderer: this.rid,
							type: 'update'
					  });
			}),
			(e.handleCommitFiberRoot = function(n) {
				var e = u(n);
				this.inst2vnode.has(e) ? this.update(n) : this.mount(n);
				var t = null;
				if (s(n)) (n.treeBaseDuration = 0), (t = n);
				else for (t = n; null != t.__; ) t = t.__;
				return (
					this.pending.push({
						internalInstance: t,
						renderer: this.rid,
						data: i(t),
						type: 'rootCommitted'
					}),
					this.flushPendingEvents(),
					n
				);
			}),
			(e.handleCommitFiberUnmount = function(n) {
				var e = u(n);
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
	function v(n) {
		return function() {
			try {
				return n.apply(void 0, arguments);
			} catch (n) {
				console.error('The react devtools encountered an error'),
					console.error(n);
			}
		};
	}
	var y = function() {},
		m = Date.now;
	try {
		m = performance.now.bind(performance);
	} catch (n) {}
	'development' === process.env.NODE_ENV &&
		((function() {
			var t = n.options.__b,
				r = n.options.diffed,
				i = n.options.vnode,
				a = n.options.__e,
				s = n.options.__,
				u = n.options.__h,
				l = c
					? {
							useEffect: new WeakMap(),
							useLayoutEffect: new WeakMap(),
							lazyPropTypes: new WeakMap()
					  }
					: null;
			(n.options.__e = function(n, e, t) {
				if (e && e.__c && 'function' == typeof n.then) {
					var r = n;
					n = new Error(
						'Missing Suspense. The throwing component was: ' + o(e)
					);
					for (var i = e; i; i = i.__)
						if (i.__c && i.__c.t) {
							n = r;
							break;
						}
					if (n instanceof Error) throw n;
				}
				a(n, e, t);
			}),
				(n.options.__ = function(n, e) {
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
						var r = o(n);
						throw new Error(
							'Expected a valid HTML node as a second argument to render.\tReceived ' +
								e +
								' instead: render(<' +
								r +
								' />, ' +
								e +
								');'
						);
					}
					s && s(n, e);
				}),
				(n.options.__b = function(n) {
					var r,
						i,
						a,
						s,
						u = n.type,
						c = (function n(e) {
							return e ? ('function' == typeof e.type ? n(e.__) : e) : {};
						})(n.__);
					if (void 0 === u)
						throw new Error(
							'Undefined component passed to createElement()\n\nYou likely forgot to export your component or might have mixed up default and named imports' +
								h(n)
						);
					if (null != u && 'object' == typeof u) {
						if (void 0 !== u.o && void 0 !== u.__e)
							throw new Error(
								'Invalid type passed to createElement(): ' +
									u +
									'\n\nDid you accidentally pass a JSX literal as JSX twice?\n\n  let My' +
									o(n) +
									' = ' +
									h(u) +
									';\n  let vnode = <My' +
									o(n) +
									' />;\n\nThis usually happens when you export a JSX literal and not the component.'
							);
						throw new Error(
							'Invalid type passed to createElement(): ' +
								(Array.isArray(u) ? 'array' : u)
						);
					}
					if (
						(('thead' !== u && 'tfoot' !== u && 'tbody' !== u) ||
						'table' === c.type
							? 'tr' === u &&
							  'thead' !== c.type &&
							  'tfoot' !== c.type &&
							  'tbody' !== c.type &&
							  'table' !== c.type
								? console.error(
										'Improper nesting of table. Your <tr> should have a <thead/tbody/tfoot/table> parent.' +
											h(n)
								  )
								: 'td' === u && 'tr' !== c.type
								? console.error(
										'Improper nesting of table. Your <td> should have a <tr> parent.' +
											h(n)
								  )
								: 'th' === u &&
								  'tr' !== c.type &&
								  console.error(
										'Improper nesting of table. Your <th> should have a <tr>.' +
											h(n)
								  )
							: console.error(
									'Improper nesting of table. Your <thead/tbody/tfoot> should have a <table> parent.' +
										h(n)
							  ),
						void 0 !== n.ref &&
							'function' != typeof n.ref &&
							'object' != typeof n.ref &&
							!('$$typeof' in n))
					)
						throw new Error(
							'Component\'s "ref" property should be a function, or an object created by createRef(), but got [' +
								typeof n.ref +
								'] instead\n' +
								h(n)
						);
					if ('string' == typeof n.type)
						for (var f in n.props)
							if (
								'o' === f[0] &&
								'n' === f[1] &&
								'function' != typeof n.props[f] &&
								null != n.props[f]
							)
								throw new Error(
									'Component\'s "' +
										f +
										'" property should be a function, but got [' +
										typeof n.props[f] +
										'] instead\n' +
										h(n)
								);
					if ('function' == typeof n.type && n.type.propTypes) {
						if (
							'Lazy' === n.type.displayName &&
							l &&
							!l.lazyPropTypes.has(n.type)
						) {
							var d =
								'PropTypes are not supported on lazy(). Use propTypes on the wrapped component itself. ';
							try {
								var p = n.type();
								l.lazyPropTypes.set(n.type, !0),
									console.warn(d + 'Component wrapped in lazy() is ' + o(p));
							} catch (n) {
								console.warn(
									d +
										"We will log the wrapped component's name once it is loaded."
								);
							}
						}
						(r = n.type.propTypes),
							(i = n.props),
							(a = o(n)),
							(s = h(n)),
							Object.keys(r).forEach(function(n) {
								var t;
								try {
									t = r[n](
										i,
										n,
										s,
										a,
										null,
										'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED'
									);
								} catch (n) {
									t = n;
								}
								!t ||
									t.message in e ||
									((e[t.message] = !0),
									console.error('Failed ' + a + ' type: ' + t.message));
							});
					}
					t && t(n);
				}),
				(n.options.__h = function(n) {
					if (!n)
						throw new Error('Hook can only be invoked from render methods.');
					u && u(n);
				});
			var f = function(n, e) {
					return {
						get: function() {
							throw new Error('getting vnode.' + n + ' is deprecated, ' + e);
						},
						set: function() {
							throw new Error('setting vnode.' + n + ' is not allowed, ' + e);
						}
					};
				},
				d = {
					nodeName: f('nodeName', 'use vnode.type'),
					attributes: f('attributes', 'use vnode.props'),
					children: f('children', 'use vnode.props.children')
				};
			(n.options.vnode = function(n) {
				var e, t;
				n.props &&
					n.props.__source &&
					((e = n.props.__source), delete n.props.__source),
					n.props &&
						n.props.__self &&
						((t = n.props.__self), delete n.props.__self),
					(n.__self = t),
					(n.__source = e),
					Object.defineProperties(n, d),
					i && i(n);
			}),
				(n.options.diffed = function(n) {
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
					var e = n.__c;
					if (e && e.i) {
						var t = e.i;
						Array.isArray(t.s) &&
							t.s.forEach(function(e) {
								if (e.u && (!e.l || !Array.isArray(e.l))) {
									var t = o(n);
									console.warn(
										'In ' +
											t +
											' you are calling useMemo/useCallback without passing arguments.\nThis is a noop since it will not be able to memoize, it will execute it every render.'
									);
								}
							}),
							Array.isArray(t.h) &&
								t.h.forEach(function(e) {
									if (!Array.isArray(e.l) && l && !l.useEffect.has(n.type)) {
										l.useEffect.set(n.type, !0);
										var t = o(n);
										console.warn(
											'You should provide an array of arguments as the second argument to the "useEffect" hook.\n\nNot doing so will invoke this effect on every render.\n\nThis effect can be found in the render of ' +
												t +
												'.'
										);
									}
								}),
							e.__h.forEach(function(e) {
								if (
									e.p &&
									!Array.isArray(e.l) &&
									l &&
									!l.useLayoutEffect.has(n.type)
								) {
									l.useLayoutEffect.set(n.type, !0);
									var t = o(n);
									console.warn(
										'You should provide an array of arguments as the second argument to the "useLayoutEffect" hook.\n\nNot doing so will invoke this effect on every render.\n\nThis effect can be found in the render of ' +
											t +
											'.'
									);
								}
							});
					}
					if ((r && r(n), null != n.__k))
						for (var i = [], a = 0; a < n.__k.length; a++) {
							var s = n.__k[a];
							if (s && null != s.key) {
								var u = s.key;
								if (-1 !== i.indexOf(u)) {
									console.error(
										'Following component has two or more children with the same key attribute: "' +
											u +
											'". This may cause glitches and misbehavior in rendering process. Component: \n\n' +
											h(n)
									);
									break;
								}
								i.push(u);
							}
						}
				});
		})(),
		(function() {
			var e = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
			if (null != e) {
				var t = y,
					o = y,
					r = Math.random()
						.toString(16)
						.slice(2),
					i = new p(e, r);
				v(function() {
					var a = !1;
					try {
						a = 'production' !== process.env.NODE_ENV;
					} catch (n) {}
					window.parent.postMessage(
						{
							source: 'react-devtools-detector',
							reactBuildType: a ? 'development' : 'production'
						},
						'*'
					);
					var s = {
						bundleType: a ? 1 : 0,
						version: '16.5.2',
						rendererPackageName: 'preact',
						findHostInstanceByFiber: function(n) {
							return n.__e;
						},
						findFiberByHostInstance: function(n) {
							return i.inst2vnode.get(n) || null;
						}
					};
					if (e._renderers) {
						(e._renderers[r] = s),
							Object.defineProperty(e.helpers, r, {
								get: function() {
									return i;
								},
								set: function() {
									i.connected || u.markConnected();
								}
							});
						var u = e.helpers[r];
						e.emit('renderer-attached', { id: r, renderer: s, helpers: u }),
							(t = v(function(t) {
								if (t.type !== n.Fragment || 0 != t.__k.length) {
									var o = e.getFiberRoots(r);
									(t = u.handleCommitFiberRoot(t)), o.has(t) || o.add(t);
								}
							})),
							(o = v(function(n) {
								e.onCommitFiberUnmount(r, n);
							}));
					} else
						console.info(
							'Preact is not compatible with your version of react-devtools. We will address this in future releases.'
						);
				})();
				var a = n.options.vnode,
					s = n.options.__c,
					u = n.options.unmount,
					l = n.options.__b,
					c = n.options.diffed;
				(n.options.vnode = function(n) {
					(n.startTime = NaN),
						(n.endTime = NaN),
						(n.startTime = 0),
						(n.endTime = -1),
						a && a(n);
				}),
					(n.options.__b = function(n) {
						(n.startTime = m()), null != l && l(n);
					}),
					(n.options.diffed = function(n) {
						(n.endTime = m()), null != c && c(n);
					}),
					(n.options.__c = v(function(n, e) {
						null != s && s(n, e), null != n && t(n);
					})),
					(n.options.unmount = v(function(n) {
						null != u && u(n), o(n);
					}));
				var f = n.Component.prototype.setState;
				n.Component.prototype.setState = function(n, e) {
					var t =
						(this.__s !== this.state && this.__s) ||
						(this.__s = Object.assign({}, this.state));
					return (this.__u = Object.assign({}, t)), f.call(this, n, e);
				};
			}
		})());
});
//# sourceMappingURL=debug.umd.js.map
