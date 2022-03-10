/**
 * @author https://gitee.com/chu1204505056/vue-admin-better （不想保留author可删除）
 * @description 路由守卫，目前两种模式：all模式与intelligence模式
 */
import router from '@/router'
import store from '@/store'
import VabProgress from 'nprogress'
import 'nprogress/nprogress.css'
import getPageTitle from '@/utils/pageTitle'
import {
  authentication,
  progressBar,
  recordRoute,
  routesWhiteList,
} from '@/config'

VabProgress.configure({
  easing: 'ease',
  speed: 500,
  trickleSpeed: 200,
  showSpinner: false,
})
router.beforeResolve(async (to, from, next) => {
  if (progressBar) VabProgress.start()
  let hasToken = store.getters['user/accessToken']
  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
      if (progressBar) VabProgress.done()
    } else {
      const hasPermissions =
        store.getters['user/username'] &&
        store.getters['user/username'].length > 0
      if (hasPermissions) {
        store.dispatch('user/addLog', to)
        next()
      } else {
        try {
          let roleisd = await store.dispatch('user/getInfo')
          let menuList = await store.dispatch('user/getMenuList', roleisd)
          let accessRoutes = await store.dispatch('routes/setRoutes', menuList)
          accessRoutes.forEach((item) => {
            router.addRoute(item)
          })
          next({ ...to, replace: true })
        } catch {
          await store.dispatch('user/resetAccessToken')
          if (progressBar) VabProgress.done()
        }
      }
    }
  } else {
    if (routesWhiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      if (recordRoute) {
        next(`/login?redirect=${to.path}`)
      } else {
        next('/login')
      }

      if (progressBar) VabProgress.done()
    }
  }
  document.title = getPageTitle(to.meta.title)
})
router.afterEach(() => {
  if (progressBar) VabProgress.done()
})
