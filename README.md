## vue-source-code-reader

This project is used to read Vue source code. vue version: 2.6.

#### usage

- build

```bash
cd ./vue
npm run dev

## in another shell
cd ..
npm run serve
```

- read code

In browser, open http://localhost:8080/. Then in Sources tab of Chrome Dev tool, `src` folder in `.` of `webpack://`, You can see the source code in `src` folder. And in `top` `localhost:3000` `vue`, You can see the source code of Vue.

#### how

- change Vue build config

In vue source code `vue/scripts/config.js`, change Rollup config, add `sourcemap: true` to `config.output` in `genConfig` function.

- build Vue

Run `npm run dev` in `vue` folder. It will generate `vue.js` and `vue.js.map` in `dist` folder. `vue.js.map` will used for vue source map

- build outer project

Using `npm run serve` will build outer project. It will generate source code of `src` folder and start server serving on `localhost:3000`.