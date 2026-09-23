<script setup lang="ts">
import { computed, onMounted, provide, ref, watch } from 'vue'
import GuidedMeditations from './guided-meditations.vue'
import MeetSpecialist from './meet-specialist.vue'
import WellnesPractices from './wellnes-practices.vue'
import Recomendations from '../recomendations/recomendations.vue'

type HelpTab = 'practices' | 'meditations' | 'specialists' | 'recommendations'

const route = useRoute()
const router = useRouter()
const tabsList = ref<HTMLElement | null>(null)

const tabs: { value: HelpTab; label: string }[] = [
  { value: 'recommendations', label: 'Recomendaciones' },
  { value: 'practices', label: 'Prácticas del bienestar' },
  { value: 'meditations', label: 'Meditaciones guiadas' },
  { value: 'specialists', label: 'Conoce especialistas' },
]

const tab = computed<HelpTab>(() => {
  return (
    tabs.find((item) => item.value === route.query.tab)?.value ||
    'recommendations'
  )
})

function selectTab(value: HelpTab) {
  return router.replace({ query: { ...route.query, tab: value } })
}

function revealActiveTab() {
  tabsList.value
    ?.querySelector('[aria-pressed="true"]')
    ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

onMounted(revealActiveTab)
watch(tab, revealActiveTab, { flush: 'post' })

const tabComponent = computed(() => {
  if (tab.value === 'meditations') return GuidedMeditations
  if (tab.value === 'specialists') return MeetSpecialist
  if (tab.value === 'recommendations') return Recomendations
  return WellnesPractices
})

provide('goToHelpTab', selectTab)
</script>

<template>
  <div class="get-help">
    <header class="get-help__tabs">
      <div
        ref="tabsList"
        class="get-help__tabs-list"
        role="group"
        aria-label="Secciones de Queremos ayudarte"
      >
        <button
          v-for="item in tabs"
          :key="item.value"
          type="button"
          class="get-help__tab"
          :class="{ 'get-help__tab--active': tab === item.value }"
          :aria-pressed="tab === item.value"
          aria-controls="help-content"
          @click="selectTab(item.value)"
        >
          {{ item.label }}
        </button>
      </div>
      <span class="get-help__curated">
        Curado por especialistas de tu institución
      </span>
    </header>

    <section
      id="help-content"
      :aria-label="tabs.find((item) => item.value === tab)?.label"
    >
      <component :is="tabComponent" />
    </section>
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
  min-height: 72px;
  flex: 0 0 auto;
  background: #fff;
  border-bottom: 1px solid #e3ecee;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  column-gap: 24px;
  padding: 0 36px;
}

.get-help__tabs-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  max-width: 100%;
  min-width: 0;
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
  color: #5c7078;
  cursor: pointer;
  white-space: nowrap;
}

.get-help__tab:hover {
  color: #065c5d;
}

.get-help__tab:focus-visible {
  outline: 2px solid #065c5d;
  outline-offset: -4px;
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
