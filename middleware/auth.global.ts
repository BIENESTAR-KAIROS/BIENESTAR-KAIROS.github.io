import { useAuthStore } from '~/store/auth'
import { UserRolEnum } from '~/interfaces/user/enum/user-rol.enum'

const unAuthRoutes = ['/', '/register', '/institute/login', '/forgot-password']

const authRoutes: string[] = [
  // ? INSTITUTE links
  '/institute/stats',
  '/institute/my-users',
  '/institute/dashboard',
  '/institute/quizzes',

  // ? USERS links
  '/user/quiz',
  '/user/news',
  '/user/history',
  '/user/quizzes',
  '/user/get-help',
  '/user/dashboard',
  '/user/privacy-policy',
  '/user/recomendations',
  '/user/update-my-data',
  '/user/meet-specialist',
  '/user/recomended-books',
  '/user/guided-maditation',
  '/user/wellnes-practices',
  '/user/profile',
  '/user/register/campus-info',

  // ? ADMIN links
  '/admin/dashboard',
]
const mainUserAuthRoute = '/user/dashboard'
const mainInstituteAuthRoute = '/institute/dashboard'

const publicRoutes: string[] = []

function isValidRoute(path: string, routes: string[]): boolean {
  return routes.some((route) => {
    if (route === '/') {
      return path === route
    }

    return path.includes(route)
  })
}

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (!process.server) {
    const authStore = useAuthStore()

    try {
      authStore.isLoading = true

      // Try refreshing auth
      try {
        await authStore.refreshAuth()

        if (authStore.isAuthenticated && !authStore.user) {
          await authStore.getMyUser()
        }
      } catch (error) {
        console.error(`Error refreshing auth`, error)

        await authStore.clearAuth()
      }

      const isAuthenticated = authStore.isAuthenticated

      // * ============ User is not authenticated ============
      if (!isAuthenticated) {
        if (isValidRoute(to.path, authRoutes)) {
          // ? is going to an authenticated route, redirect to login
          return navigateTo('/')
        } else if (isValidRoute(to.path, unAuthRoutes)) {
          // ? is going to an unauthenticated route, allow it
          return
        } else if (isValidRoute(to.path, publicRoutes)) {
          return
        } else {
          // ? is going to an unknown route, redirect to login
          return navigateTo('/')
        }

        // * ============ User is authenticated ============
      } else {
        if (isValidRoute(to.path, unAuthRoutes)) {
          // ? is going to an unauthenticated route, proced
          return
        } else if (isValidRoute(to.path, authRoutes)) {
          // is going to an authenticated route, allow it
          if (
            to.path.includes('admin') &&
            authStore.user!.roles.find(
              (rol) => rol === UserRolEnum.KAIROS_ADMIN,
            )
          )
            return
          else if (
            to.path.includes('institute') &&
            (authStore.user!.roles.find(
              (rol) => rol === UserRolEnum.KAIROS_ADMIN,
            ) ||
              authStore.user!.roles.find(
                (rol) => rol === UserRolEnum.INSTITUTION_ADMIN,
              ) ||
              authStore.user!.roles.find(
                (rol) => rol === UserRolEnum.INSTITUTION_STAFF,
              ))
          )
            return
          else if (to.path.includes('user')) return
          else return navigateTo('/')
        } else if (isValidRoute(to.path, publicRoutes)) {
          return
        } else {
          // is going to an unknown route, redirect to main auth page
          return navigateTo(mainUserAuthRoute)
        }
      }
    } catch (error) {
      console.error(`Error checking auth`, error)
      await authStore.clearAuth()
      return navigateTo('/')
    } finally {
      authStore.isLoading = false
    }
  }
})
