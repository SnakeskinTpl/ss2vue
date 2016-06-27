/*!
 * ss2vue
 * https://github.com/SnakeskinTpl/ss2vue
 *
 * Released under the MIT license
 * https://github.com/SnakeskinTpl/ss2vue/blob/master/LICENSE
 */

require('core-js/es6/object');

var
	snakeskin = require('snakeskin'),
	compiler = require('vue-template-compiler');

function toFunction(code) {
	return 'function () {' + code + '}';
}

var options = {
	modules: [{
		postTransformNode: function (el) {
			if (el.tag === 'img') {
				el.staticAttrs && el.staticAttrs.some(rewrite);
			}
		}
	}]
};

function rewrite(attr) {
	if (attr.name === 'src') {
		var firstChar = attr.value[1];

		if (firstChar === '.' || firstChar === '~') {
			if (firstChar === '~') {
				attr.value = '"' + attr.value.slice(2);
			}

			attr.value = 'require(' + attr.value + ')';
		}

		return true;
	}
}

function setParams(p) {
	p = Object.assign({}, p, {useStrict: false});
	p.adaptorOptions = Object.assign({}, p.adaptorOptions, p.adaptorOptions.requireImgUrls ? options : undefined);
	return p;
}

function template(id, fn, txt, p) {
	var compiled = compiler.compile(txt, p);

	txt = '{' +
		'render:' + toFunction(compiled.render) + ',' +
		'staticRenderFns: [' + compiled.staticRenderFns.map(toFunction).join(',') + ']' +
	'}';

	return id + ' = ' + fn + 'return ' + txt + '};';
}

exports.adaptor = function (txt, opt_params, opt_info) {
	return snakeskin.adaptor(txt, {
		setParams: setParams,
		template: template
	}, opt_params, opt_info);
};
