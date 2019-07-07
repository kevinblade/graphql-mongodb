module.exports = {
	env: {
		commonjs: true,
		es6: true,
		node: true
	},
	extends: ['eslint:recommended', 'plugin:vue/base'],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly'
	},
	parserOptions: {
		ecmaVersion: 2018
	},
	rules: {
		'linebreak-style': ['error', 'unix'],
		'no-console': 'off'
	}
};
