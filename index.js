import lodash from 'lodash';

function parsePath(path) {
  const re = /(\/\w+)/ig;
  const paths = path.split(re);
  const filteredPaths = paths.filter(i => i);
  const subPath = filteredPaths.pop();
  return {
    subPath,
    path: filteredPaths.join(''),
  };
}

export default function (context,  options = {}) {
  if (typeof context.keys !== 'function') {
    throw new Error('only accept function exported by require.context');
  }

  const specialRoutes = new Map();
  const routes = [];

  const keys = context.keys();

  // 要使用continue
  for (let i = 0, l = keys.length; i < l; i += 1) {
    const key = keys[i];
    if (options.ignore && options.ignore.test(key)) continue;

    const component = context(key).default;
    const path = key.replace(options.fileReg || /\.|\/index\.vue$/g, '');
    const name = path.replace(/\.|\//g, '');

    // 组装基本路由
    const route = {
      path,
      name: component.name || name,
    };

    // 判断用户是否设置了redirect
    if (component.redirect) {
      route.redirect = component.redirect;
    } else {
      route.component = component;
    }

    // 放入到routes集合中
    routes.push(route);

    // 使用一个比较长的变量来控制是否被父组件挂载
    // 需要另外一个集合来记录这个特殊的组件
    if (component.isBeMountedByTheParentComponent === true) {
      specialRoutes.set(path, route);
    }

    // 将需要被挂载的组件挂到父组件的children对象中
    let parsedPath = null;
    specialRoutes.forEach((value, key) => {
      parsedPath = parsePath(key);
      if (parsedPath.path === path) {
        const specialRoute = {
          name: value.name || name,
          path: parsedPath.subPath,
          component: lodash.cloneDeep(value),
        };
        
        // 遍历routes，将specialRoute放入到其children中
        routes.forEach((item) => {
          if (item.path === parsedPath.path) {
            if (item.children) {
              item.children.push(specialRoute);
            } else {
              item.children = [specialRoute];
            }
          }
        });
      }
    });

    // 把挂载到父组件中的子组件打个标记
    routes.forEach((item) => {
      if (parsedPath && item.path === (parsedPath.path + parsedPath.subPath)) {
        item.path = null;
      }
    });
  }

  // 返回纯粹的路由
  return routes.filter(item => item.path);
}