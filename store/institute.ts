import { defineStore } from 'pinia'
import type { IDashboardStatisticsInstituteResponse } from '~/dto/response/institute/dashboard-statistics-institute.response.dto'

export const useInstituteStore = defineStore('institute', {
  state: () => {
    return {
      statistics: null as IDashboardStatisticsInstituteResponse | null,
    }
  },
})
