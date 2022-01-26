!(function (e, n) {
	'object' == typeof exports && 'undefined' != typeof module
		? n(exports, require('preact'))
		: 'function' == typeof define && define.amd
		? define(['exports', 'preact'], n)
		: n(((e || self).jsxRuntime = {}), e.preact);
})(this, function (e, n) {
	var o = 0;
	function t(e, t, r, f, i) {
		var u = {};
		for (var c in t) 'ref' != c && (u[c] = t[c]);
		var p,
			s,
			a = {
				type: e,
				props: u,
				key: r,
				ref: t && t.ref,
				constructor: void 0,
				__v: --o,
				__source: f,
				__self: i
			};
		if ('function' == typeof e && (p = e.defaultProps))
			for (s in p) void 0 === u[s] && (u[s] = p[s]);
		return n.options.vnode && n.options.vnode(a), a;
	}
	Object.defineProperty(e, 'Fragment', {
		enumerable: !0,
		get: function () {
			return n.Fragment;
		}
	}),
		(e.jsx = t),
		(e.jsxDEV = t),
		(e.jsxs = t);
});
//# sourceMappingURL=jsxRuntime.umd.js.map
