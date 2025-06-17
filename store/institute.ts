import { defineStore } from 'pinia'
import type { IStatsResponse } from '~/interfaces/stats/stats.interface'

export const useInstituteStore = defineStore('institute', {
  state: () => {
    return {
      statistics: null as IStatsResponse | null,
    }
  },
})
