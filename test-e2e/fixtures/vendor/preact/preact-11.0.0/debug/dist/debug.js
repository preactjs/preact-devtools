var e = require('preact'),
	n = require('preact/src/constants'),
	t = require('preact/compat/src/util');
require('preact/devtools');
var o = {};
function r(n) {
	return n.type === e.Fragment
		? 'Fragment'
		: 'function' == typeof n.type
		? n.type.displayName || n.type.name
		: 'string' == typeof n.type
		? n.type
		: '#text';
}
var a = [],
	i = [];
function s() {
	return a.length > 0 ? a[a.length - 1] : null;
}
var c = !1;
function l(n) {
	return 'function' == typeof n.type && n.type != e.Fragment;
}
function p(e) {
	for (var n = [e], t = e; null != t.__o; ) n.push(t.__o), (t = t.__o);
	return n.reduce((e, n) => {
		e += '  in ' + r(n);
		var t = n.props && n.props.__source;
		return (
			t
				? (e += ' (at ' + t.fileName + ':' + t.lineNumber + ')')
				: c ||
				  ((c = !0),
				  console.warn(
						'Add @babel/plugin-transform-react-jsx-source to get a more detailed component stack. Note that you should not add it to production builds of your App for bundle size reasons.'
				  )),
			e + '\n'
		);
	}, '');
}
var u = 'function' == typeof WeakMap;
function d(e) {
	return e ? ('function' == typeof e.type ? d(e.__) : e) : {};
}
var f = e.Component.prototype.setState;
e.Component.prototype.setState = function (e, t) {
	return (
		null == this.__i
			? null == this.state &&
			  console.warn(
					'Calling "this.setState" inside the constructor of a component is a no-op and might be a bug in your application. Instead, set "this.state = {}" directly.\n\n' +
						p(s())
			  )
			: this.__i.flags & n.MODE_UNMOUNTING &&
			  console.warn(
					'Can\'t call "this.setState" on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.\n\n' +
						p(this.__i)
			  ),
		f.call(this, e, t)
	);
};
var h = e.Component.prototype.forceUpdate;
function y(e) {
	var { props: n } = e,
		t = r(e),
		o = '';
	for (var a in n)
		if (n.hasOwnProperty(a) && 'children' !== a) {
			var i = n[a];
			'function' == typeof i &&
				(i = 'function ' + (i.displayName || i.name) + '() {}'),
				(i =
					Object(i) !== i || i.toString
						? i + ''
						: Object.prototype.toString.call(i)),
				(o += ' ' + a + '=' + JSON.stringify(i));
		}
	var s = n.children;
	return '<' + t + o + (s && s.length ? '>..</' + t + '>' : ' />');
}
(e.Component.prototype.forceUpdate = function (e) {
	return (
		null == this.__i
			? console.warn(
					'Calling "this.forceUpdate" inside the constructor of a component is a no-op and might be a bug in your application.\n\n' +
						p(s())
			  )
			: this.__i.flags & n.MODE_UNMOUNTING &&
			  console.warn(
					'Can\'t call "this.forceUpdate" on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.\n\n' +
						p(this.__i)
			  ),
		h.call(this, e)
	);
}),
	(function () {
		!(function () {
			var n = e.options.__b,
				t = e.options.diffed,
				o = e.options.__,
				r = e.options.vnode,
				s = e.options.__i,
				c = e.options.__r;
			(e.options.diffed = (e) => {
				l(e) && i.pop(), a.pop(), t && t(e);
			}),
				(e.options.__b = (e, t) => {
					l(e) && a.push(e), n && n(e, t);
				}),
				(e.options.__ = (e, n) => {
					(i = []), o && o(e, n);
				}),
				(e.options.vnode = (e) => {
					(e.__o = i.length > 0 ? i[i.length - 1] : null), r && r(e);
				}),
				(e.options.__i = (e, n) => {
					null !== e.type && (e.__o = n.__o), s && s(e, n);
				}),
				(e.options.__r = (e) => {
					l(e) && i.push(e), c && c(e);
				});
		})();
		var n = !1,
			s = e.options.__b,
			c = e.options.diffed,
			f = e.options.vnode,
			h = e.options.__e,
			m = e.options.__,
			v = e.options.__h,
			b = u
				? {
						useEffect: new WeakMap(),
						useLayoutEffect: new WeakMap(),
						lazyPropTypes: new WeakMap()
				  }
				: null,
			w = [];
		(e.options.__e = (e, n, t) => {
			if (n && n.__c && 'function' == typeof e.then) {
				var o = e;
				e = new Error('Missing Suspense. The throwing component was: ' + r(n));
				for (var a = n; a; a = a.__)
					if (a.__c && a.__c.__c) {
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
			(e.options.__ = (e, n) => {
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
					var o = r(e);
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
				m && m(e, n);
			}),
			(e.options.__b = (e, a) => {
				if (null !== a && 'object' == typeof a) {
					if (void 0 !== a.constructor) {
						var i = Object.keys(a).join(',');
						throw new Error(
							'Objects are not valid as a child. Encountered an object with the keys {' +
								i +
								'}.\n\n' +
								p(e)
						);
					}
					var { type: c, __: l } = e;
					if (void 0 === c)
						throw new Error(
							'Undefined component passed to createElement()\n\nYou likely forgot to export your component or might have mixed up default and named imports' +
								y(a) +
								'\n\n' +
								p(e)
						);
					if (null != c && 'object' == typeof c) {
						if (void 0 === c.constructor)
							throw new Error(
								'Invalid type passed to createElement(): ' +
									c +
									'\n\nDid you accidentally pass a JSX literal as JSX twice?\n\n  let My' +
									r(e) +
									' = ' +
									y(c) +
									';\n  let vnode = <My' +
									r(e) +
									' />;\n\nThis usually happens when you export a JSX literal and not the component.\n\n' +
									p(e)
							);
						throw new Error(
							'Invalid type passed to createElement(): ' +
								(Array.isArray(c) ? 'array' : c)
						);
					}
					var u = d(l);
					(n = !0),
						('thead' !== c && 'tfoot' !== c && 'tbody' !== c) ||
						'table' === u.type
							? 'tr' === c &&
							  'thead' !== u.type &&
							  'tfoot' !== u.type &&
							  'tbody' !== u.type &&
							  'table' !== u.type
								? console.error(
										'Improper nesting of table. Your <tr> should have a <thead/tbody/tfoot/table> parent.' +
											y(e) +
											'\n\n' +
											p(e)
								  )
								: 'td' === c && 'tr' !== u.type
								? console.error(
										'Improper nesting of table. Your <td> should have a <tr> parent.' +
											y(e) +
											'\n\n' +
											p(e)
								  )
								: 'th' === c &&
								  'tr' !== u.type &&
								  console.error(
										'Improper nesting of table. Your <th> should have a <tr>.' +
											y(e) +
											'\n\n' +
											p(e)
								  )
							: console.error(
									'Improper nesting of table. Your <thead/tbody/tfoot> should have a <table> parent.' +
										y(e) +
										'\n\n' +
										p(e)
							  );
					var f = '$$typeof' in a;
					if (
						void 0 !== e.ref &&
						'function' != typeof e.ref &&
						'object' != typeof e.ref &&
						!f
					)
						throw new Error(
							'Component\'s "ref" property should be a function, or an object created by createRef(), but got [' +
								typeof e.ref +
								'] instead\n' +
								y(e) +
								'\n\n' +
								p(e)
						);
					if ('string' == typeof e.type)
						for (var h in a.props) {
							if (
								'o' === h[0] &&
								'n' === h[1] &&
								'function' != typeof a.props[h] &&
								null != a.props[h]
							)
								throw new Error(
									'Component\'s "' +
										h +
										'" property should be a function, but got [' +
										typeof a.props[h] +
										'] instead\n' +
										y(a) +
										'\n\n' +
										p(e)
								);
							if (
								!f &&
								'style' === h &&
								null !== a.props[h] &&
								'object' == typeof a.props[h]
							) {
								var m = a.props[h];
								for (var v in m)
									'number' != typeof m[v] ||
										t.IS_NON_DIMENSIONAL.test(v) ||
										console.warn(
											'Numeric CSS property value is missing a "px" unit: ' +
												v +
												': ' +
												m[v] +
												'"\n' +
												y(a) +
												'\n\n' +
												p(a)
										);
							}
						}
					if ('function' == typeof e.type && e.type.propTypes) {
						if (
							'Lazy' === e.type.displayName &&
							b &&
							!b.lazyPropTypes.has(e.type)
						) {
							var w =
								'PropTypes are not supported on lazy(). Use propTypes on the wrapped component itself. ';
							try {
								var g = e.type();
								b.lazyPropTypes.set(e.type, !0),
									console.warn(w + 'Component wrapped in lazy() is ' + r(g));
							} catch (e) {
								console.warn(
									w +
										"We will log the wrapped component's name once it is loaded."
								);
							}
						}
						var E = a ? a.props : e.props;
						e.type.__f && delete (E = Object.assign({}, E)).ref,
							(function (e, n, t, r, a) {
								Object.keys(e).forEach((t) => {
									var i;
									try {
										i = e[t](
											n,
											t,
											r,
											'prop',
											null,
											'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED'
										);
									} catch (e) {
										i = e;
									}
									i &&
										!(i.message in o) &&
										((o[i.message] = !0),
										console.error(
											'Failed prop type: ' +
												i.message +
												((a && '\n' + a()) || '')
										));
								});
							})(e.type.propTypes, E, 0, r(e), () => p(e));
					}
					s && s(e, a);
				}
			}),
			(e.options.__h = (e, t, o) => {
				if (!e || !n)
					throw new Error('Hook can only be invoked from render methods.');
				v && v(e, t, o);
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
		(e.options.vnode = (e) => {
			var n = e.props;
			null != n &&
				('__source' in n || '__self' in n) &&
				(Object.defineProperties(n, _),
				(e.__source = n.__source),
				(e.__self = n.__self)),
				(e.__proto__ = k),
				f && f(e);
		}),
			(e.options.diffed = (e) => {
				if (((n = !1), c && c(e), null != e.__k))
					for (var t = [], o = 0; o < e.__k.length; o++) {
						var r = e.__k[o];
						if (r && null != r.key) {
							var a = r.key;
							if (-1 !== t.indexOf(a)) {
								console.error(
									'Following component has two or more children with the same key attribute: "' +
										a +
										'". This may cause glitches and misbehavior in rendering process. Component: \n\n' +
										y(e) +
										'\n\n' +
										p(e)
								);
								break;
							}
							t.push(a);
						}
					}
			});
	})(),
	(exports.resetPropWarnings = function () {
		o = {};
	});
//# sourceMappingURL=debug.js.map
