'use strict';

/*!
 * ss2vue
 * https://github.com/SnakeskinTpl/ss2vue
 *
 * Released under the MIT license
 * https://github.com/SnakeskinTpl/ss2vue/blob/master/LICENSE
 */

const
	snakeskin = require('snakeskin'),
	compiler = require('vue-template-compiler');

function toFunction(code) {
	return `function () {${code}}`;
}

const options = {
	modules: [{
		postTransformNode(el) {
			if (el.tag === 'img') {
				el.attrs && el.attrs.some(rewrite);
			}
		}
	}]
};

function rewrite(attr) {
	if (attr.name === 'src') {
		const
			firstChar = attr.value[1];

		if (firstChar === '.' || firstChar === '~') {
			if (firstChar === '~') {
				attr.value = `"${attr.value.slice(2)}`;
			}

			attr.value = `require(${attr.value})`;
		}

		return true;
	}
}

function setParams(p) {
	p = Object.assign({}, p, {useStrict: false});
	p.adapterOptions = Object.assign({}, p.adapterOptions, p.adapterOptions.requireImgUrls ? options : undefined);
	return p;
}

function template(id, fn, txt, p) {
	const
		compiled = compiler.compile(txt, p);

	txt = `{
		render: ${toFunction(compiled.render)},
		staticRenderFns: [${compiled.staticRenderFns.map(toFunction).join(',')}]
	};`;

	return `${id} = ${fn}return ${txt}};`;
}

exports.adapter = function (txt, opt_params, opt_info) {
	return snakeskin.adapter(txt, {setParams, template}, opt_params, opt_info);
};
