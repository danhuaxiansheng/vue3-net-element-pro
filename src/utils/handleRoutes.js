import Layout from '@/layouts'

function getConstRoter(menu) {
  let tem = {}
  if (menu.component === 'Layout' && menu.filepath) {
    tem = {
      path: '',
      component: Layout,
      redirect: menu.redirect || null,
      hidden: menu.isHide ? true : false,
      children: [
        {
          path: menu.path,
          name: menu.name || '',
          component: () => import(`@/views/${menu.filepath}`),
          meta: {
            icon: menu.icon,
            title: menu.title,
          },
        },
      ],
    }
  } else {
    tem = {
      meta: {
        icon: menu.icon,
        title: menu.title,
      },
      path: menu.path,
      name: menu.name || '',
      component:
        menu.component === 'Layout'
          ? Layout
          : () => import(`@/views/${menu.filepath}`),
      hidden: menu.isHide ? true : false,
    }
  }

  if (menu.children && menu.children.length > 0) {
    tem.children = []
    menu.children.forEach((item) => {
      tem.children.push(getConstRoter(item))
    })
  }
  return tem
}

export function filterAsyncRoutes(userMenus) {
  const res = []
  userMenus.forEach((route) => {
    res.push(getConstRoter(route))
  })
  return res
}
