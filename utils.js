function lerp(a, b, t) {
	return a + (b - a) * t;
}

function getIntersection(a, b, c, d) {
	const tTop = (d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x);
	const uTop = (c.y - a.y) * (a.x - b.x) - (c.x - a.x) * (a.y - b.y);
	const bottom = (d.y - c.y) * (b.x - a.x) - (d.x - c.x) * (b.y - a.y);

	if (bottom != 0) {
		const t = tTop / bottom;
		const u = uTop / bottom;
		if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
			return {
				x: lerp(a.x, b.x, t),
				y: lerp(a.y, b.y, t),
				offset: t,
			};
		}
	}
	return null;
}

function polysIntersect(poly1, poly2) {
	for (let i = 0; i < poly1.length; i++) {
		for (let j = 0; j < poly2.length; j++) {
			const touch = getIntersection(
				poly1[i],
				poly1[(i + 1) % poly1.length],
				poly2[j],
				poly2[(j + 1) % poly2.length]
			);
			if (touch) {
				return true;
			}
		}
	}
	return false;
}

function getRGBA(value) {
	const alpha = Math.abs(value);
	const R = value < 0 ? 100 : 255;
	const G = value < 0 ? 0 : R;
	const B = G;
	return 'rgba(' + R + ',' + G + ',' + B + ',' + alpha + ')';
}

function setDecimal(amount, decimal) {
	return Math.round(amount * Math.pow(10, decimal)) / Math.pow(10, decimal < 0 ? 0 : decimal);
}

function pitagoras(cateto1, cateto2) {
	const hypotenuse = Math.pow(cateto1, 2) + Math.pow(cateto2, 2);
	return Math.sqrt(hypotenuse);
}
