<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

interface INewsArticle {
  title: string
  description: string
  content?: string
  url: string
  image?: string
  publishedAt?: string
  source?: { name?: string; url?: string }
}

interface ISavedArticle {
  title: string
  url: string
}

const topicKeywords: Record<string, string> = {
  Ansiedad: 'ansiedad',
  Sueño: 'sueño',
  'Redes sociales': 'redes sociales',
  Duelo: 'duelo',
  Universidades: 'universidades',
}

const allTopics = Object.keys(topicKeywords)
const gradientBySlot = [
  'linear-gradient(140deg, #DBF2F4, #c3e3ea 60%, #F0EAF5)',
  'linear-gradient(140deg, #F0EAF5, #d9cde8)',
  'linear-gradient(140deg, #DBF2F4, #a9dbe0)',
  'linear-gradient(140deg, #eef2f3, #d3dee1)',
]

const runtimeConfig = useRuntimeConfig()

const isLoading = ref(true)
const articles = ref<INewsArticle[]>([])
const visibleCount = ref(4)
const followedTopics = ref<string[]>(['Ansiedad', 'Sueño'])
const savedArticles = ref<ISavedArticle[]>([])
const weeklyDigest = ref(false)

const featured = computed(() => articles.value[0] ?? null)
const listArticles = computed(() =>
  articles.value.slice(1, visibleCount.value),
)
const hasMore = computed(() => visibleCount.value < articles.value.length)

function formatDate(value?: string): string {
  if (!value) return ''
  return new Date(value)
    .toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

function readingTime(article: INewsArticle): string {
  const words = `${article.content || ''} ${article.description || ''}`
    .trim()
    .split(/\s+/).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} min de lectura`
}

function isSaved(article: INewsArticle): boolean {
  return savedArticles.value.some((item) => item.url === article.url)
}

function toggleSaved(article: INewsArticle) {
  const already = isSaved(article)
  savedArticles.value = already
    ? savedArticles.value.filter((item) => item.url !== article.url)
    : [...savedArticles.value, { title: article.title, url: article.url }]

  localStorage.setItem(
    'kairos_saved_news',
    JSON.stringify(savedArticles.value),
  )
}

function toggleTopic(topic: string) {
  followedTopics.value = followedTopics.value.includes(topic)
    ? followedTopics.value.filter((item) => item !== topic)
    : [...followedTopics.value, topic]

  localStorage.setItem(
    'kairos_news_topics',
    JSON.stringify(followedTopics.value),
  )
}

function toggleWeeklyDigest() {
  weeklyDigest.value = !weeklyDigest.value
  localStorage.setItem('kairos_weekly_digest', String(weeklyDigest.value))
}

function showMore() {
  visibleCount.value = articles.value.length
}

async function fetchNews() {
  try {
    isLoading.value = true
    const keywords = followedTopics.value.map((topic) => topicKeywords[topic])
    const query =
      keywords.length > 0
        ? `salud mental (${keywords.join(' OR ')})`
        : 'salud mental'

    const params = new URLSearchParams({
      apikey: runtimeConfig.app.newsApiKey as string,
      q: query,
      lang: 'es',
      max: '10',
    })

    const response = await fetch(
      `https://gnews.io/api/v4/search?${params.toString()}`,
    )
    const data = await response.json()
    articles.value = data.articles ?? []
    visibleCount.value = 4
  } catch (error) {
    console.log(error)
    articles.value = []
  } finally {
    isLoading.value = false
  }
}

watch(followedTopics, fetchNews)

onMounted(() => {
  try {
    const storedTopics = JSON.parse(
      localStorage.getItem('kairos_news_topics') || 'null',
    )
    if (Array.isArray(storedTopics)) followedTopics.value = storedTopics

    const storedSaved = JSON.parse(
      localStorage.getItem('kairos_saved_news') || '[]',
    )
    savedArticles.value = storedSaved

    weeklyDigest.value = localStorage.getItem('kairos_weekly_digest') === 'true'
  } catch {
    // ignore malformed local storage
  }

  fetchNews()
})
</script>

<template>
  <div class="news">
    <div v-if="isLoading" class="news__loading">
      <v-progress-circular color="primary" indeterminate />
    </div>

    <div v-else class="news__layout">
      <div class="news__main">
        <article v-if="featured" class="hero">
          <div
            class="hero__banner"
            :style="{ backgroundImage: gradientBySlot[0] }"
          >
            <span class="hero__badge">
              Destacada
              <template v-if="featured.source?.name">
                · {{ featured.source.name }}
              </template>
            </span>
          </div>
          <div class="hero__body">
            <div class="hero__meta">
              <span class="hero__source">{{ featured.source?.name || 'Fuente' }}</span>
              <span>·</span>
              <span>{{ formatDate(featured.publishedAt) }}</span>
              <span>·</span>
              <span>{{ readingTime(featured) }}</span>
            </div>
            <span class="hero__title">{{ featured.title }}</span>
            <span class="hero__description">{{ featured.description }}</span>
            <div class="hero__actions">
              <a
                :href="featured.url"
                target="_blank"
                rel="noopener"
                class="hero__read"
              >
                Leer la nota
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7" /><path d="M8 7h9v9" /></svg>
              </a>
              <button
                type="button"
                class="hero__save"
                :class="{ 'hero__save--active': isSaved(featured) }"
                @click="toggleSaved(featured)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" :fill="isSaved(featured) ? '#065C5D' : 'none'" stroke="#0E2A36" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12v17l-6-4-6 4z" /></svg>
              </button>
            </div>
          </div>
        </article>

        <article
          v-for="(article, i) in listArticles"
          :key="article.url"
          class="news-row"
        >
          <div
            class="news-row__thumb"
            :style="{ backgroundImage: gradientBySlot[(i + 1) % gradientBySlot.length] }"
          />
          <div class="news-row__copy">
            <div class="news-row__meta">
              <span>{{ article.source?.name || 'Fuente' }} · {{ formatDate(article.publishedAt) }} · {{ readingTime(article) }}</span>
            </div>
            <span class="news-row__title">{{ article.title }}</span>
            <span class="news-row__description">{{ article.description }}</span>
          </div>
          <div class="news-row__actions">
            <button
              type="button"
              class="news-row__save"
              :class="{ 'news-row__save--active': isSaved(article) }"
              @click="toggleSaved(article)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" :fill="isSaved(article) ? '#065C5D' : 'none'" stroke="#0E2A36" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12v17l-6-4-6 4z" /></svg>
            </button>
            <a :href="article.url" target="_blank" rel="noopener" class="news-row__link">
              Leer
            </a>
          </div>
        </article>

        <div v-if="articles.length === 0" class="news__empty">
          No encontramos noticias para tus temas seguidos en este momento.
        </div>

        <div v-if="hasMore" class="news__more">
          <button type="button" class="news__more-btn" @click="showMore">
            Ver más noticias
          </button>
        </div>
      </div>

      <aside class="news__sidebar">
        <div class="sidebar-card">
          <span class="sidebar-card__title">Temas que sigues</span>
          <div class="sidebar-card__chips">
            <button
              v-for="topic in allTopics"
              :key="topic"
              type="button"
              class="topic-chip"
              :class="{ 'topic-chip--active': followedTopics.includes(topic) }"
              @click="toggleTopic(topic)"
            >
              {{ followedTopics.includes(topic) ? topic : `+ ${topic}` }}
            </button>
          </div>
          <span class="sidebar-card__hint">
            Los temas que sigues ordenan esta lista de noticias.
          </span>
        </div>

        <div class="sidebar-card">
          <span class="sidebar-card__title">Guardadas</span>
          <template v-if="savedArticles.length > 0">
            <div
              v-for="article in savedArticles.slice(0, 4)"
              :key="article.url"
              class="saved-item"
            >
              <span class="saved-item__dot" />
              <a :href="article.url" target="_blank" rel="noopener">
                {{ article.title }}
              </a>
            </div>
            <span v-if="savedArticles.length > 4" class="sidebar-card__hint">
              Tienes {{ savedArticles.length }} guardadas.
            </span>
          </template>
          <span v-else class="sidebar-card__hint">
            Toca el ícono de guardar en una noticia para verla aquí.
          </span>
        </div>

        <div class="sidebar-card sidebar-card--lavender">
          <span class="sidebar-card__title sidebar-card__title--lavender">
            Resumen semanal
          </span>
          <span class="sidebar-card__hint sidebar-card__hint--lavender">
            Guarda tu preferencia en este dispositivo para priorizar un resumen
            de tus temas cada semana.
          </span>
          <button
            type="button"
            class="toggle"
            :class="{ 'toggle--on': weeklyDigest }"
            @click="toggleWeeklyDigest"
          >
            <span class="toggle__thumb" />
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.news__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}

.news__layout {
  display: grid;
  grid-template-columns: 1fr 372px;
  gap: 22px;
  align-items: start;
}

.news__main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.hero__banner {
  height: 210px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  padding: 18px;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: #fff;
  color: #065c5d;
  font-size: 12px;
  font-weight: 700;
}

.hero__body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hero__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #5f767e;
}

.hero__source {
  font-weight: 700;
  color: #0e2a36;
}

.hero__title {
  font-size: 25px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.hero__description {
  font-size: 16px;
  line-height: 1.6;
  color: #4b5f68;
}

.hero__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.hero__read {
  height: 44px;
  padding: 0 22px;
  border-radius: 999px;
  border: 0;
  background: #065c5d;
  color: #fff;
  font-family: 'Figtree', sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.hero__read:hover {
  background: #07979f;
}

.hero__save {
  height: 44px;
  width: 44px;
  border-radius: 999px;
  border: 2px solid #cfdde1;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.hero__save:hover,
.hero__save--active {
  border-color: #07979f;
}

.news-row {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  padding: 22px;
  display: flex;
  gap: 20px;
  align-items: center;
}

.news-row__thumb {
  width: 112px;
  flex: 0 0 112px;
  height: 96px;
  border-radius: 16px;
  background-size: cover;
  background-position: center;
}

.news-row__copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.news-row__meta {
  font-size: 12px;
  color: #5f767e;
}

.news-row__title {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.news-row__description {
  font-size: 14px;
  line-height: 1.55;
  color: #4b5f68;
}

.news-row__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.news-row__save {
  height: 40px;
  width: 40px;
  border-radius: 999px;
  border: 2px solid #cfdde1;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.news-row__save--active {
  border-color: #07979f;
}

.news-row__link {
  height: 40px;
  padding: 0 18px;
  border-radius: 999px;
  border: 2px solid #cfdde1;
  display: inline-flex;
  align-items: center;
  color: #0e2a36;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

.news-row__link:hover {
  border-color: #07979f;
  color: #07979f;
}

.news__empty {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  padding: 22px;
  font-size: 14px;
  color: #5f767e;
}

.news__more {
  display: flex;
  justify-content: center;
  padding-top: 2px;
}

.news__more-btn {
  height: 44px;
  padding: 0 24px;
  border-radius: 999px;
  border: 2px solid #cfdde1;
  background: #fff;
  font-family: 'Figtree', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #0e2a36;
  cursor: pointer;
}

.news__more-btn:hover {
  border-color: #07979f;
  color: #07979f;
}

.news__sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-card {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-card__title {
  font-size: 16px;
  font-weight: 800;
}

.sidebar-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.topic-chip {
  height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  font-family: 'Figtree', sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background: #f4f8f9;
  border: 1px solid #dde8ea;
  color: #41585f;
}

.topic-chip--active {
  background: #065c5d;
  border-color: #065c5d;
  color: #fff;
  font-weight: 700;
}

.sidebar-card__hint {
  font-size: 13px;
  line-height: 1.5;
  color: #5f767e;
}

.saved-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.saved-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #07979f;
  margin-top: 7px;
  flex: 0 0 8px;
}

.saved-item a {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.45;
  color: #0e2a36;
  text-decoration: none;
}

.saved-item a:hover {
  color: #07979f;
}

.sidebar-card--lavender {
  background: #f0eaf5;
  border: 0;
}

.sidebar-card__title--lavender {
  color: #3f3358;
}

.sidebar-card__hint--lavender {
  color: #4a3d63;
}

.toggle {
  align-self: flex-start;
  width: 44px;
  height: 26px;
  border-radius: 999px;
  border: 0;
  background: #cbb9dc;
  padding: 3px;
  display: inline-flex;
  cursor: pointer;
  margin-top: 2px;
}

.toggle--on {
  background: #5c4a75;
  justify-content: flex-end;
}

.toggle__thumb {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #fff;
}

@media (max-width: 1180px) {
  .news__layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .news-row {
    flex-direction: column;
    align-items: stretch;
  }

  .news-row__thumb {
    width: 100%;
  }

  .news-row__actions {
    justify-content: flex-end;
  }
}
</style>
