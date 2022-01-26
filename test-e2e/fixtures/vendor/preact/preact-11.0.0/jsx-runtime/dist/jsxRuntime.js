var r = require('preact'),
	e = 0;
function t(t, o, n, f, i) {
	var p = {};
	for (var u in o) 'ref' != u && (p[u] = o[u]);
	var c,
		s,
		a = {
			type: t,
			props: p,
			key: n,
			ref: o && o.ref,
			constructor: void 0,
			__v: --e,
			__source: f,
			__self: i
		};
	if ('function' == typeof t && (c = t.defaultProps))
		for (s in c) void 0 === p[s] && (p[s] = c[s]);
	return r.options.vnode && r.options.vnode(a), a;
}
Object.defineProperty(exports, 'Fragment', {
	enumerable: !0,
	get: function () {
		return r.Fragment;
	}
}),
	(exports.jsx = t),
	(exports.jsxDEV = t),
	(exports.jsxs = t);
//# sourceMappingURL=jsxRuntime.js.map
