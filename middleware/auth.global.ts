import { useAuthStore } from '~/store/auth'
import { USER_TYPE } from '~/interfaces/users/user.interface'

const unAuthRoutes = ['/', '/register', '/institute/login', '/forgot-password']

const authRoutes: string[] = [
  // ? INSTITUTE links
  '/institute/stats',
  '/institute/my-users',
  '/institute/dashboard',
  '/institute/quizzes',
  '/institute/quizzes/add-quiz',

  // ? USERS links
  '/user/quiz/:id',
  '/user/news',
  '/user/quiz',
  '/user/quiz/results',
  '/user/history',
  '/user/quizzes',
  '/user/get-help',
  '/user/dashboard',
  '/user/quiz/do-the-quizz',
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

    return path.startsWith(route)
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

      if (isAuthenticated && authStore.user?.type === USER_TYPE.STUDENT) {
        await authStore.clearAuth()
        return navigateTo(mainUserAuthRoute)
      }
      if (
        isAuthenticated &&
        (authStore.user?.type === USER_TYPE.INSTITUTION ||
          authStore.user?.type === USER_TYPE.ADMINISTRATIVE)
      ) {
        await authStore.clearAuth()
        return navigateTo(mainInstituteAuthRoute)
      }

      // ============ User is not authenticated ============
      if (!isAuthenticated) {
        if (isValidRoute(to.path, authRoutes)) {
          // is going to an authenticated route, redirect to login
          return navigateTo('/')
        } else if (isValidRoute(to.path, unAuthRoutes)) {
          // is going to an unauthenticated route, allow it
          return
        } else if (isValidRoute(to.path, publicRoutes)) {
          return
        } else {
          // is going to an unknown route, redirect to login
          return navigateTo('/')
        }
        // ============ User is authenticated ============
      } else {
        if (isValidRoute(to.path, unAuthRoutes)) {
          // is going to an unauthenticated route, redirect to main auth page
          if (authStore.user?.type === USER_TYPE.STUDENT)
            return navigateTo(mainUserAuthRoute)
          else if (
            authStore.user?.type === USER_TYPE.INSTITUTION ||
            authStore.user?.type === USER_TYPE.ADMINISTRATIVE
          )
            return navigateTo(mainInstituteAuthRoute)
        } else if (isValidRoute(to.path, authRoutes)) {
          // is going to an authenticated route, allow it
          return
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
