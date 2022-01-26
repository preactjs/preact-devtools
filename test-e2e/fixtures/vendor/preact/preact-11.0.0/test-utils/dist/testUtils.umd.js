!(function (e, t) {
	'object' == typeof exports && 'undefined' != typeof module
		? t(exports, require('preact'))
		: 'function' == typeof define && define.amd
		? define(['exports', 'preact'], t)
		: t(((e || self).preactTestUtils = {}), e.preact);
})(this, function (e, t) {
	function n() {
		return (
			(t.options.t = t.options.debounceRendering),
			(t.options.debounceRendering = (e) => (t.options.o = e)),
			() => t.options.o && t.options.o()
		);
	}
	var o = (e) => null != e && 'function' == typeof e.then,
		r = 0;
	function i() {
		t.options.o && (t.options.o(), delete t.options.o),
			void 0 !== t.options.t
				? ((t.options.debounceRendering = t.options.t), delete t.options.t)
				: (t.options.debounceRendering = void 0);
	}
	(e.act = function (e) {
		if (++r > 1) {
			var f = e();
			return o(f)
				? f.then(() => {
						--r;
				  })
				: (--r, Promise.resolve());
		}
		var u,
			c,
			d = t.options.requestAnimationFrame,
			l = n();
		t.options.requestAnimationFrame = (e) => (u = e);
		var a,
			p,
			s = () => {
				try {
					for (l(); u; ) (c = u), (u = null), c(), l();
					i();
				} catch (e) {
					a || (a = e);
				}
				(t.options.requestAnimationFrame = d), --r;
			};
		try {
			p = e();
		} catch (e) {
			a = e;
		}
		if (o(p))
			return p.then(s, (e) => {
				throw (s(), e);
			});
		if ((s(), a)) throw a;
		return Promise.resolve();
	}),
		(e.setupRerender = n),
		(e.teardown = i);
});
//# sourceMappingURL=testUtils.umd.js.map
