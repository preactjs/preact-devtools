let e = { data: "" },
	t = t =>
		"object" == typeof window
			? (
					(t ? t.querySelector("#_goober") : window._goober) ||
					Object.assign(
						(t || document.head).appendChild(document.createElement("style")),

						{ innerHTML: " ", id: "_goober" },
					)
			  ).firstChild
			: t || e,
	r = e => {
		let r = t(e),
			l = r.data;

		return (r.data = ""), l;
	},
	l = /(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(})/g,
	a = /\/\*[^]*?\*\/|\s\s+|\n/g,
	o = (e, t) => {
		let r,
			l = "",
			a = "",
			n = "";

		for (let c in e) {
			let s = e[c];

			"object" == typeof s
				? ((r = t
						? t.replace(/([^,])+/g, e =>
								c.replace(
									/([^,])+/g,

									t => (/&/.test(t) ? t.replace(/&/g, e) : e ? e + " " + t : t),
								),
						  )
						: c),
				  (a +=
						"@" == c[0]
							? "f" == c[1]
								? o(s, c)
								: c + "{" + o(s, "k" == c[1] ? "" : t) + "}"
							: o(s, r)))
				: "@" == c[0] && "i" == c[1]
				? (l = c + " " + s + ";")
				: ((c = c.replace(/[A-Z]/g, "-$&").toLowerCase()),
				  (n += o.p ? o.p(c, s) : c + ":" + s + ";"));
		}

		return n[0] ? ((r = t ? t + "{" + n + "}" : n), l + r + a) : l + a;
	},
	n = {},
	c = e => {
		let t = "";

		for (let r in e) t += r + ("object" == typeof e[r] ? c(e[r]) : e[r]);

		return t;
	},
	s = (e, t, r, s, i) => {
		let p = "object" == typeof e ? c(e) : e,
			u =
				n[p] ||
				(n[p] = (e => {
					let t = 0,
						r = 11;

					for (; t < e.length; ) r = (101 * r + e.charCodeAt(t++)) >>> 0;

					return "go" + r;
				})(p));

		if (!n[u]) {
			let t =
				"object" == typeof e
					? e
					: (e => {
							let t,
								r = [{}];

							for (; (t = l.exec(e.replace(a, ""))); )
								t[4] && r.shift(),
									t[3]
										? r.unshift((r[0][t[3]] = r[0][t[3]] || {}))
										: t[4] || (r[0][t[1]] = t[2]);

							return r[0];
					  })(e);

			n[u] = o(i ? { ["@keyframes " + u]: t } : t, r ? "" : "." + u);
		}

		return (
			((e, t, r) => {
				-1 == t.data.indexOf(e) && (t.data = r ? e + t.data : t.data + e);
			})(n[u], t, s),
			u
		);
	},
	i = (e, t, r) =>
		e.reduce((e, l, a) => {
			let n = t[a];

			if (n && n.call) {
				let e = n(r),
					t = (e && e.props && e.props.className) || (/^go/.test(e) && e);

				n = t
					? "." + t
					: e && "object" == typeof e
					? e.props
						? ""
						: o(e, "")
					: e;
			}

			return e + l + (null == n ? "" : n);
		}, "");

function p(e) {
	let r = this || {},
		l = e.call ? e(r.p) : e;

	return s(
		l.unshift
			? l.raw
				? i(l, [].slice.call(arguments, 1), r.p)
				: l.reduce(
						(e, t) => (t ? Object.assign(e, t.call ? t(r.p) : t) : e),

						{},
				  )
			: l,

		t(r.target),

		r.g,

		r.o,

		r.k,
	);
}

let u,
	f,
	d,
	g = p.bind({ g: 1 }),
	b = p.bind({ k: 1 });

function h(e, t, r, l) {
	(o.p = t), (u = e), (f = r), (d = l);
}

function j(e, t) {
	let r = this || {};

	return function () {
		let l = arguments;

		function a(o, n) {
			let c = Object.assign({}, o),
				s = c.className || a.className;

			(r.p = Object.assign({ theme: f && f() }, c)),
				(r.o = / *go\d+/.test(s)),
				(c.className = p.apply(r, l) + (s ? " " + s : "")),
				t && (c.ref = n);

			let i = c.as || e;

			return delete c.as, d && i[0] && d(c), u(i, c);
		}

		return t ? t(a) : a;
	};
}

export {
	p as css,
	r as extractCss,
	g as glob,
	b as keyframes,
	h as setup,
	j as styled,
};
