import { useAuthStore } from '~/store/auth'
import { USER_TYPE } from '~/interfaces/users/user.interface'

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
    console.log(1)

    try {
      authStore.isLoading = true
      console.log(2)

      // Try refreshing auth
      try {
        await authStore.refreshAuth()
        console.log(3)

        if (authStore.isAuthenticated && !authStore.user) {
          await authStore.getMyUser()
          console.log(4)
        }
      } catch (error) {
        console.error(`Error refreshing auth`, error)

        await authStore.clearAuth()
      }

      const isAuthenticated = authStore.isAuthenticated
      console.log(5)

      // ============ User is not authenticated ============
      if (!isAuthenticated) {
        console.log('not auth')
        console.log(8)

        if (isValidRoute(to.path, authRoutes)) {
          console.log(9)

          // is going to an authenticated route, redirect to login
          return navigateTo('/')
        } else if (isValidRoute(to.path, unAuthRoutes)) {
          console.log(10)

          // is going to an unauthenticated route, allow it
          return
        } else if (isValidRoute(to.path, publicRoutes)) {
          console.log(11)

          return
        } else {
          // is going to an unknown route, redirect to login
          console.log(12)

          return navigateTo('/')
        }
        // ============ User is authenticated ============
      } else {
        console.log('is auth')
        console.log(12)

        if (isValidRoute(to.path, unAuthRoutes)) {
          console.log(14)

          // is going to an unauthenticated route, redirect to main auth page
          if (authStore.user?.type === USER_TYPE.STUDENT) {
            console.log(15)

            return navigateTo(mainUserAuthRoute)
          } else if (
            authStore.user?.type === USER_TYPE.INSTITUTION ||
            authStore.user?.type === USER_TYPE.ADMINISTRATIVE
          ) {
            console.log(16)

            return navigateTo(mainInstituteAuthRoute)
          }
        } else if (isValidRoute(to.path, authRoutes)) {
          console.log(17)

          // is going to an authenticated route, allow it
          return
        } else if (isValidRoute(to.path, publicRoutes)) {
          console.log(18)

          return
        } else {
          console.log(19)

          // is going to an unknown route, redirect to main auth page
          return navigateTo(mainUserAuthRoute)
        }
      }
    } catch (error) {
      console.log(20)

      console.error(`Error checking auth`, error)
      await authStore.clearAuth()
      return navigateTo('/')
    } finally {
      console.log(21)

      authStore.isLoading = false
    }
  }
})
