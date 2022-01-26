var r = require('preact');
function t() {
	return (
		(r.options.t = r.options.debounceRendering),
		(r.options.debounceRendering = (t) => (r.options.o = t)),
		() => r.options.o && r.options.o()
	);
}
var e = (r) => null != r && 'function' == typeof r.then,
	o = 0;
function n() {
	r.options.o && (r.options.o(), delete r.options.o),
		void 0 !== r.options.t
			? ((r.options.debounceRendering = r.options.t), delete r.options.t)
			: (r.options.debounceRendering = void 0);
}
(exports.act = function (i) {
	if (++o > 1) {
		var u = i();
		return e(u)
			? u.then(() => {
					--o;
			  })
			: (--o, Promise.resolve());
	}
	var c,
		f,
		a = r.options.requestAnimationFrame,
		v = t();
	r.options.requestAnimationFrame = (r) => (c = r);
	var l,
		p,
		s = () => {
			try {
				for (v(); c; ) (f = c), (c = null), f(), v();
				n();
			} catch (r) {
				l || (l = r);
			}
			(r.options.requestAnimationFrame = a), --o;
		};
	try {
		p = i();
	} catch (r) {
		l = r;
	}
	if (e(p))
		return p.then(s, (r) => {
			throw (s(), r);
		});
	if ((s(), l)) throw l;
	return Promise.resolve();
}),
	(exports.setupRerender = t),
	(exports.teardown = n);
//# sourceMappingURL=testUtils.js.map
