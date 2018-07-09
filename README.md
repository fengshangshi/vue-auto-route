# vue-auto-route

## Usage
1. import autoRoute from 'auto-route';
2. const routes = autoRoute(require.context('@/view', true, /index\.vue$/));
3. put the routes into vue-router
```js
import autoRoute from 'vue-auto-route';
const routes = autoRoute(require.context('@/view', true, /index\.vue$/));

new Router({
  routes: [
    ...routes,
  ],
});
```

## API

autoRoute(context, options)

1. context: must generate by [require.context](https://webpack.js.org/guides/dependency-management/#require-context)
2. options: 
    options.ignore path RegExp which you don't want to put into router
    options.fileReg file RegExp which you want to replace empty string
3. If a sub-component that you want to be mounted father-component, you should write them in vue instance:
```js
export default {
  name: 'ASubComponentName',
  isBeMountedByTheParentComponent: true,
  data() {
    return {
      ...
    };
  },
}
```
4. In the father-component, you can write a 'redirect' property that can redirect to sub-component:
```js
export default {
  redirect: 'path/to/sub/component'
  name: 'AFatherComponentName',
  data() {
    return {
      ...
    };
  },
}
```

## Tips
1. route'name is token from vue instance's name, please make sure that every vue component has a name;
2. Route which nests other child routes should be plat with child routes, like this:
```js
├── config.js
├── fatherRoute.vue
├── childRoute1
│   └── index.vue
│   └── config.js
├── childRoute2
│   └── index.vue
│   └── config.js
```