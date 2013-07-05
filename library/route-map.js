function map(app, a, route) {
    route = route || '';
    for (var key in a) {
		switch (typeof a[key]) {
			case 'object': // { '/path': { ... }}
				app.map(app, a[key], route + key);
				break;
			case 'function': // get: function(){ ... }
				app[key](route, a[key]);
				break;
		}
    }
};

module.exports = {
	map: map
};