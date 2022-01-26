!(function (e, n) {
	'object' == typeof exports && 'undefined' != typeof module
		? n(
				exports,
				require('preact'),
				require('preact/src/constants'),
				require('preact/compat/src/util'),
				require('preact/devtools')
		  )
		: 'function' == typeof define && define.amd
		? define([
				'exports',
				'preact',
				'preact/src/constants',
				'preact/compat/src/util',
				'preact/devtools'
		  ], n)
		: n(((e || self).preactDebug = {}), e.preact, e.constants, e.util);
})(this, function (e, n, t, o) {
	var r = {};
	function a(e) {
		return e.type === n.Fragment
			? 'Fragment'
			: 'function' == typeof e.type
			? e.type.displayName || e.type.name
			: 'string' == typeof e.type
			? e.type
			: '#text';
	}
	var i = [],
		s = [];
	function c() {
		return i.length > 0 ? i[i.length - 1] : null;
	}
	var l = !1;
	function p(e) {
		return 'function' == typeof e.type && e.type != n.Fragment;
	}
	function u(e) {
		for (var n = [e], t = e; null != t.__o; ) n.push(t.__o), (t = t.__o);
		return n.reduce((e, n) => {
			e += '  in ' + a(n);
			var t = n.props && n.props.__source;
			return (
				t
					? (e += ' (at ' + t.fileName + ':' + t.lineNumber + ')')
					: l ||
					  ((l = !0),
					  console.warn(
							'Add @babel/plugin-transform-react-jsx-source to get a more detailed component stack. Note that you should not add it to production builds of your App for bundle size reasons.'
					  )),
				e + '\n'
			);
		}, '');
	}
	var d = 'function' == typeof WeakMap;
	function f(e) {
		return e ? ('function' == typeof e.type ? f(e.__) : e) : {};
	}
	var h = n.Component.prototype.setState;
	n.Component.prototype.setState = function (e, n) {
		return (
			null == this.__i
				? null == this.state &&
				  console.warn(
						'Calling "this.setState" inside the constructor of a component is a no-op and might be a bug in your application. Instead, set "this.state = {}" directly.\n\n' +
							u(c())
				  )
				: this.__i.flags & t.MODE_UNMOUNTING &&
				  console.warn(
						'Can\'t call "this.setState" on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.\n\n' +
							u(this.__i)
				  ),
			h.call(this, e, n)
		);
	};
	var y = n.Component.prototype.forceUpdate;
	function m(e) {
		var { props: n } = e,
			t = a(e),
			o = '';
		for (var r in n)
			if (n.hasOwnProperty(r) && 'children' !== r) {
				var i = n[r];
				'function' == typeof i &&
					(i = 'function ' + (i.displayName || i.name) + '() {}'),
					(i =
						Object(i) !== i || i.toString
							? i + ''
							: Object.prototype.toString.call(i)),
					(o += ' ' + r + '=' + JSON.stringify(i));
			}
		var s = n.children;
		return '<' + t + o + (s && s.length ? '>..</' + t + '>' : ' />');
	}
	(n.Component.prototype.forceUpdate = function (e) {
		return (
			null == this.__i
				? console.warn(
						'Calling "this.forceUpdate" inside the constructor of a component is a no-op and might be a bug in your application.\n\n' +
							u(c())
				  )
				: this.__i.flags & t.MODE_UNMOUNTING &&
				  console.warn(
						'Can\'t call "this.forceUpdate" on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.\n\n' +
							u(this.__i)
				  ),
			y.call(this, e)
		);
	}),
		(function () {
			!(function () {
				var e = n.options.__b,
					t = n.options.diffed,
					o = n.options.__,
					r = n.options.vnode,
					a = n.options.__i,
					c = n.options.__r;
				(n.options.diffed = (e) => {
					p(e) && s.pop(), i.pop(), t && t(e);
				}),
					(n.options.__b = (n, t) => {
						p(n) && i.push(n), e && e(n, t);
					}),
					(n.options.__ = (e, n) => {
						(s = []), o && o(e, n);
					}),
					(n.options.vnode = (e) => {
						(e.__o = s.length > 0 ? s[s.length - 1] : null), r && r(e);
					}),
					(n.options.__i = (e, n) => {
						null !== e.type && (e.__o = n.__o), a && a(e, n);
					}),
					(n.options.__r = (e) => {
						p(e) && s.push(e), c && c(e);
					});
			})();
			var e = !1,
				t = n.options.__b,
				c = n.options.diffed,
				l = n.options.vnode,
				h = n.options.__e,
				y = n.options.__,
				v = n.options.__h,
				b = d
					? {
							useEffect: new WeakMap(),
							useLayoutEffect: new WeakMap(),
							lazyPropTypes: new WeakMap()
					  }
					: null,
				w = [];
			(n.options.__e = (e, n, t) => {
				if (n && n.__c && 'function' == typeof e.then) {
					var o = e;
					e = new Error(
						'Missing Suspense. The throwing component was: ' + a(n)
					);
					for (var r = n; r; r = r.__)
						if (r.__c && r.__c.__c) {
							e = o;
							break;
						}
					if (e instanceof Error) throw e;
				}
				try {
					h(e, n, t),
						'function' != typeof e.then &&
							setTimeout(() => {
								throw e;
							});
				} catch (e) {
					throw e;
				}
			}),
				(n.options.__ = (e, n) => {
					if (!n)
						throw new Error(
							'Undefined parent passed to render(), this is the second argument.\nCheck if the element is available in the DOM/has the correct id.'
						);
					var t;
					switch (n.nodeType) {
						case 1:
						case 11:
						case 9:
							t = !0;
							break;
						default:
							t = !1;
					}
					if (!t) {
						var o = a(e);
						throw new Error(
							'Expected a valid HTML node as a second argument to render.\tReceived ' +
								n +
								' instead: render(<' +
								o +
								' />, ' +
								n +
								');'
						);
					}
					y && y(e, n);
				}),
				(n.options.__b = (n, i) => {
					if (null !== i && 'object' == typeof i) {
						if (void 0 !== i.constructor) {
							var s = Object.keys(i).join(',');
							throw new Error(
								'Objects are not valid as a child. Encountered an object with the keys {' +
									s +
									'}.\n\n' +
									u(n)
							);
						}
						var { type: c, __: l } = n;
						if (void 0 === c)
							throw new Error(
								'Undefined component passed to createElement()\n\nYou likely forgot to export your component or might have mixed up default and named imports' +
									m(i) +
									'\n\n' +
									u(n)
							);
						if (null != c && 'object' == typeof c) {
							if (void 0 === c.constructor)
								throw new Error(
									'Invalid type passed to createElement(): ' +
										c +
										'\n\nDid you accidentally pass a JSX literal as JSX twice?\n\n  let My' +
										a(n) +
										' = ' +
										m(c) +
										';\n  let vnode = <My' +
										a(n) +
										' />;\n\nThis usually happens when you export a JSX literal and not the component.\n\n' +
										u(n)
								);
							throw new Error(
								'Invalid type passed to createElement(): ' +
									(Array.isArray(c) ? 'array' : c)
							);
						}
						var p = f(l);
						(e = !0),
							('thead' !== c && 'tfoot' !== c && 'tbody' !== c) ||
							'table' === p.type
								? 'tr' === c &&
								  'thead' !== p.type &&
								  'tfoot' !== p.type &&
								  'tbody' !== p.type &&
								  'table' !== p.type
									? console.error(
											'Improper nesting of table. Your <tr> should have a <thead/tbody/tfoot/table> parent.' +
												m(n) +
												'\n\n' +
												u(n)
									  )
									: 'td' === c && 'tr' !== p.type
									? console.error(
											'Improper nesting of table. Your <td> should have a <tr> parent.' +
												m(n) +
												'\n\n' +
												u(n)
									  )
									: 'th' === c &&
									  'tr' !== p.type &&
									  console.error(
											'Improper nesting of table. Your <th> should have a <tr>.' +
												m(n) +
												'\n\n' +
												u(n)
									  )
								: console.error(
										'Improper nesting of table. Your <thead/tbody/tfoot> should have a <table> parent.' +
											m(n) +
											'\n\n' +
											u(n)
								  );
						var d = '$$typeof' in i;
						if (
							void 0 !== n.ref &&
							'function' != typeof n.ref &&
							'object' != typeof n.ref &&
							!d
						)
							throw new Error(
								'Component\'s "ref" property should be a function, or an object created by createRef(), but got [' +
									typeof n.ref +
									'] instead\n' +
									m(n) +
									'\n\n' +
									u(n)
							);
						if ('string' == typeof n.type)
							for (var h in i.props) {
								if (
									'o' === h[0] &&
									'n' === h[1] &&
									'function' != typeof i.props[h] &&
									null != i.props[h]
								)
									throw new Error(
										'Component\'s "' +
											h +
											'" property should be a function, but got [' +
											typeof i.props[h] +
											'] instead\n' +
											m(i) +
											'\n\n' +
											u(n)
									);
								if (
									!d &&
									'style' === h &&
									null !== i.props[h] &&
									'object' == typeof i.props[h]
								) {
									var y = i.props[h];
									for (var v in y)
										'number' != typeof y[v] ||
											o.IS_NON_DIMENSIONAL.test(v) ||
											console.warn(
												'Numeric CSS property value is missing a "px" unit: ' +
													v +
													': ' +
													y[v] +
													'"\n' +
													m(i) +
													'\n\n' +
													u(i)
											);
								}
							}
						if ('function' == typeof n.type && n.type.propTypes) {
							if (
								'Lazy' === n.type.displayName &&
								b &&
								!b.lazyPropTypes.has(n.type)
							) {
								var w =
									'PropTypes are not supported on lazy(). Use propTypes on the wrapped component itself. ';
								try {
									var g = n.type();
									b.lazyPropTypes.set(n.type, !0),
										console.warn(w + 'Component wrapped in lazy() is ' + a(g));
								} catch (e) {
									console.warn(
										w +
											"We will log the wrapped component's name once it is loaded."
									);
								}
							}
							var E = i ? i.props : n.props;
							n.type.__f && delete (E = Object.assign({}, E)).ref,
								(function (e, n, t, o, a) {
									Object.keys(e).forEach((t) => {
										var i;
										try {
											i = e[t](
												n,
												t,
												o,
												'prop',
												null,
												'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED'
											);
										} catch (e) {
											i = e;
										}
										i &&
											!(i.message in r) &&
											((r[i.message] = !0),
											console.error(
												'Failed prop type: ' +
													i.message +
													((a && '\n' + a()) || '')
											));
									});
								})(n.type.propTypes, E, 0, a(n), () => u(n));
						}
						t && t(n, i);
					}
				}),
				(n.options.__h = (n, t, o) => {
					if (!n || !e)
						throw new Error('Hook can only be invoked from render methods.');
					v && v(n, t, o);
				});
			var g = (e, n) => ({
					get() {
						var t = 'get' + e + n;
						w &&
							w.indexOf(t) < 0 &&
							(w.push(t),
							console.warn('getting vnode.' + e + ' is deprecated, ' + n));
					},
					set() {
						var t = 'set' + e + n;
						w &&
							w.indexOf(t) < 0 &&
							(w.push(t),
							console.warn('setting vnode.' + e + ' is not allowed, ' + n));
					}
				}),
				E = {
					nodeName: g('nodeName', 'use vnode.type'),
					attributes: g('attributes', 'use vnode.props'),
					children: g('children', 'use vnode.props.children')
				},
				_ = { __source: { enumerable: !1 }, __self: { enumerable: !1 } },
				k = Object.create({}, E);
			(n.options.vnode = (e) => {
				var n = e.props;
				null != n &&
					('__source' in n || '__self' in n) &&
					(Object.defineProperties(n, _),
					(e.__source = n.__source),
					(e.__self = n.__self)),
					(e.__proto__ = k),
					l && l(e);
			}),
				(n.options.diffed = (n) => {
					if (((e = !1), c && c(n), null != n.__k))
						for (var t = [], o = 0; o < n.__k.length; o++) {
							var r = n.__k[o];
							if (r && null != r.key) {
								var a = r.key;
								if (-1 !== t.indexOf(a)) {
									console.error(
										'Following component has two or more children with the same key attribute: "' +
											a +
											'". This may cause glitches and misbehavior in rendering process. Component: \n\n' +
											m(n) +
											'\n\n' +
											u(n)
									);
									break;
								}
								t.push(a);
							}
						}
				});
		})(),
		(e.resetPropWarnings = function () {
			r = {};
		});
});
//# sourceMappingURL=debug.umd.js.map
