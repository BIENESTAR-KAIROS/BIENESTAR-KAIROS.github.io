<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import GuidedMeditations from './guided-meditations.vue'
import MeetSpecialist from './meet-specialist.vue'
import WellnesPractices from './wellnes-practices.vue'

type HelpTab = 'practices' | 'meditations' | 'specialists'

const tab = ref<HelpTab>('practices')

const tabs: { value: HelpTab; label: string }[] = [
  { value: 'practices', label: 'Prácticas del bienestar' },
  { value: 'meditations', label: 'Meditaciones guiadas' },
  { value: 'specialists', label: 'Conoce especialistas' },
]

const tabComponent = computed(() => {
  if (tab.value === 'meditations') return GuidedMeditations
  if (tab.value === 'specialists') return MeetSpecialist
  return WellnesPractices
})

provide('goToHelpTab', (value: HelpTab) => {
  tab.value = value
})
</script>

<template>
  <div class="get-help">
    <header class="get-help__tabs">
      <div class="get-help__tabs-list">
        <button
          v-for="item in tabs"
          :key="item.value"
          type="button"
          class="get-help__tab"
          :class="{ 'get-help__tab--active': tab === item.value }"
          @click="tab = item.value"
        >
          {{ item.label }}
        </button>
      </div>
      <span class="get-help__curated">
        Curado por especialistas de tu institución
      </span>
    </header>

    <component :is="tabComponent" />
  </div>
</template>

<style scoped>
.get-help {
  font-family: 'Figtree', sans-serif;
  color: #0e2a36;
  background: #f4f8f9;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.get-help__tabs {
  height: 72px;
  flex: 0 0 72px;
  background: #fff;
  border-bottom: 1px solid #e3ecee;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 36px;
}

.get-help__tabs-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.get-help__tab {
  height: 48px;
  padding: 0 18px;
  flex: 0 0 auto;
  border: 0;
  border-bottom: 3px solid transparent;
  background: transparent;
  font-family: 'Figtree', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #5f767e;
  cursor: pointer;
  white-space: nowrap;
}

.get-help__tab:hover {
  color: #065c5d;
}

.get-help__tab--active {
  color: #065c5d;
  font-weight: 700;
  border-bottom-color: #065c5d;
}

.get-help__curated {
  padding-bottom: 14px;
  font-size: 13px;
  color: #5f767e;
  flex: 0 0 auto;
  white-space: nowrap;
}

@media (max-width: 720px) {
  .get-help__tabs {
    padding: 0 18px;
  }

  .get-help__curated {
    display: none;
  }
}
</style>
