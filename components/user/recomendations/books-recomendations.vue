<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

interface IBook {
  key: string
  title: string
  cover_edition_key?: string
  cover_i?: number
  author_name?: string[]
}

interface ITopic {
  label: string
  query: string | null
}

const topics: ITopic[] = [
  { label: 'Todos', query: null },
  { label: 'Ansiedad', query: 'anxiety' },
  { label: 'Sueño', query: 'sleep' },
  { label: 'Autoestima', query: 'self-esteem' },
  { label: 'Vida universitaria', query: 'college students' },
  { label: 'Duelo', query: 'grief' },
]

const badgeStyles = [
  { bg: '#DBF2F4', color: '#065C5D' },
  { bg: '#F0EAF5', color: '#5c4a75' },
  { bg: '#eef2f3', color: '#41585f' },
]

const motiveByTopic: Record<string, string> = {
  Ansiedad: 'Puede ayudarte a manejar momentos de ansiedad.',
  Sueño: 'Enfocado en mejorar tus hábitos de sueño.',
  Autoestima: 'Trabaja la autoestima y el diálogo interno.',
  'Vida universitaria': 'Pensado para los retos de la vida universitaria.',
  Duelo: 'Acompaña procesos de duelo y pérdida.',
  Bienestar: 'Una lectura general sobre bienestar y salud mental.',
}

const rotatingTopics = [
  'Ansiedad',
  'Sueño',
  'Autoestima',
  'Vida universitaria',
  'Duelo',
  'Bienestar',
]

const isLoading = ref(true)
const books = ref<IBook[]>([])
const failedCovers = ref<Set<string>>(new Set())
const activeTopic = ref<ITopic>(topics[0])
const sortBy = ref<'relevance' | 'new'>('relevance')
const savedBooks = ref<Set<string>>(new Set())

const featuredBook = computed(() => books.value[0] ?? null)
const gridBooks = computed(() => books.value.slice(1, 8))

function coverUrl(book: IBook): string | null {
  if (book.cover_edition_key) {
    return `https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-L.jpg`
  }
  if (book.cover_i) {
    return `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
  }
  return null
}

function hasCover(book: IBook): boolean {
  const url = coverUrl(book)
  return !!url && !failedCovers.value.has(book.key)
}

function onCoverError(book: IBook) {
  failedCovers.value = new Set(failedCovers.value).add(book.key)
}

function topicForIndex(index: number): string {
  return rotatingTopics[index % rotatingTopics.length]
}

function badgeForIndex(index: number) {
  return badgeStyles[index % badgeStyles.length]
}

function workUrl(book: IBook): string {
  return `https://openlibrary.org${book.key}`
}

function isSaved(book: IBook): boolean {
  return savedBooks.value.has(book.key)
}

function toggleSaved(book: IBook) {
  const next = new Set(savedBooks.value)
  if (next.has(book.key)) {
    next.delete(book.key)
  } else {
    next.add(book.key)
  }
  savedBooks.value = next
  localStorage.setItem('kairos_saved_books', JSON.stringify([...next]))
}

function leaveReview() {
  const review = window.prompt(
    '¿Qué te dejó esta lectura? Se guarda solo en este dispositivo.',
  )
  if (review) {
    const key = 'kairos_book_reviews'
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    existing.push({ review, date: new Date().toISOString() })
    localStorage.setItem(key, JSON.stringify(existing))
    alert('¡Gracias! Guardamos tu comentario en este dispositivo.')
  }
}

async function fetchBooks() {
  try {
    isLoading.value = true
    const params = new URLSearchParams({
      subject: 'salud mental',
      limit: '13',
    })

    if (activeTopic.value.query) {
      params.set('q', activeTopic.value.query)
    }
    if (sortBy.value === 'new') {
      params.set('sort', 'new')
    }

    const response = await fetch(
      `https://openlibrary.org/search.json?${params.toString()}`,
    )
    const data = await response.json()
    books.value = data.docs ?? []
  } catch (error) {
    console.log(error)
    books.value = []
  } finally {
    isLoading.value = false
  }
}

function selectTopic(topic: ITopic) {
  activeTopic.value = topic
}

watch([activeTopic, sortBy], fetchBooks)

onMounted(() => {
  try {
    const stored = JSON.parse(
      localStorage.getItem('kairos_saved_books') || '[]',
    )
    savedBooks.value = new Set(stored)
  } catch {
    savedBooks.value = new Set()
  }
  fetchBooks()
})
</script>

<template>
  <div class="books">
    <div v-if="isLoading" class="books__loading">
      <v-progress-circular color="primary" indeterminate />
    </div>

    <div v-else class="books__content">
      <div v-if="featuredBook" class="featured">
        <div v-if="hasCover(featuredBook)" class="featured__cover">
          <img
            :src="coverUrl(featuredBook)!"
            alt=""
            @error="onCoverError(featuredBook)"
          />
        </div>
        <div v-else class="featured__cover featured__cover--placeholder">
          <span class="featured__cover-label">Portada</span>
          <span class="featured__cover-title">{{ featuredBook.title }}</span>
        </div>

        <div class="featured__body">
          <span class="featured__tag">Lectura de la semana</span>
          <div class="featured__heading">
            <span class="featured__title">{{ featuredBook.title }}</span>
            <span class="featured__meta">
              {{ featuredBook.author_name?.[0] || 'Autor desconocido' }}
              · Disponible en OpenLibrary
            </span>
          </div>
          <div class="featured__reason">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#07979F" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 4.6 4.6 1.9-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" /></svg>
            <span>
              Te lo sugerimos porque
              <strong v-if="activeTopic.query">
                coincide con el tema "{{ activeTopic.label }}".
              </strong>
              <strong v-else>
                conecta con bienestar general y hábitos saludables.
              </strong>
            </span>
          </div>
          <div class="featured__actions">
            <a
              :href="workUrl(featuredBook)"
              target="_blank"
              rel="noopener"
              class="featured__btn featured__btn--primary"
            >
              Ver ficha
            </a>
            <button
              type="button"
              class="featured__btn featured__btn--secondary"
              @click="toggleSaved(featuredBook)"
            >
              {{ isSaved(featuredBook) ? 'Guardado' : 'Guardar para después' }}
            </button>
          </div>
        </div>
      </div>

      <div class="filters">
        <span class="filters__label">Filtrar por tema</span>
        <button
          v-for="topic in topics"
          :key="topic.label"
          type="button"
          class="filters__chip"
          :class="{ 'filters__chip--active': activeTopic.label === topic.label }"
          @click="selectTopic(topic)"
        >
          {{ topic.label }}
        </button>
        <label class="filters__sort">
          Ordenar por:
          <select v-model="sortBy">
            <option value="relevance">Más afín a mí</option>
            <option value="new">Más recientes</option>
          </select>
        </label>
      </div>

      <div v-if="gridBooks.length === 0" class="books__empty">
        No encontramos libros para este tema. Prueba con "Todos".
      </div>

      <div v-else class="books__grid">
        <div v-for="(book, i) in gridBooks" :key="book.key" class="book-card">
          <div v-if="hasCover(book)" class="book-card__cover">
            <img :src="coverUrl(book)!" alt="" @error="onCoverError(book)" />
          </div>
          <div v-else class="book-card__cover book-card__cover--placeholder">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5V6a2 2 0 0 1 2-2h11a1 1 0 0 1 1 1v14" /><path d="M6 17h12v3H6a2 2 0 0 1 0-4h12" /></svg>
            <span>Sin portada</span>
          </div>

          <div class="book-card__copy">
            <span class="book-card__title">{{ book.title }}</span>
            <span class="book-card__author">
              {{ book.author_name?.[0] || 'Autor desconocido' }}
            </span>
          </div>

          <span
            class="book-card__badge"
            :style="{
              background: badgeForIndex(i).bg,
              color: badgeForIndex(i).color,
            }"
          >
            {{ topicForIndex(i) }}
          </span>
          <span class="book-card__motive">
            {{ motiveByTopic[topicForIndex(i)] }}
          </span>

          <a
            :href="workUrl(book)"
            target="_blank"
            rel="noopener"
            class="book-card__link"
          >
            Ver ficha
          </a>
        </div>

        <div class="review-card">
          <img src="/image-dashboard-20.png" alt="" class="review-card__icon" />
          <span class="review-card__title">¿Leíste alguno?</span>
          <span class="review-card__subtitle">
            Cuéntanos qué te dejó y ajustamos las próximas recomendaciones.
          </span>
          <button type="button" class="review-card__btn" @click="leaveReview">
            Dejar reseña
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.books__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}

.books__content {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.featured {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  padding: 26px;
  display: flex;
  gap: 28px;
  align-items: center;
}

.featured__cover {
  width: 150px;
  flex: 0 0 150px;
  aspect-ratio: 2 / 3;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 14px 28px -14px rgba(6, 92, 93, 0.6);
}

.featured__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured__cover--placeholder {
  background: linear-gradient(160deg, #0b6f70, #04494a);
  color: #dff1f1;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.featured__cover-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.8;
}

.featured__cover-title {
  font-size: 19px;
  font-weight: 800;
  line-height: 1.2;
}

.featured__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.featured__tag {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: #f0eaf5;
  color: #5c4a75;
  font-size: 12px;
  font-weight: 700;
}

.featured__heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.featured__title {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.featured__meta {
  font-size: 16px;
  color: #5c7078;
}

.featured__reason {
  display: flex;
  gap: 12px;
  background: #f4f8f9;
  border-radius: 18px;
  padding: 16px 18px;
  align-items: flex-start;
}

.featured__reason svg {
  flex: 0 0 20px;
  margin-top: 2px;
}

.featured__reason span {
  font-size: 15px;
  line-height: 1.55;
  color: #31474f;
}

.featured__actions {
  display: flex;
  gap: 10px;
  margin-top: 2px;
}

.featured__btn {
  height: 44px;
  padding: 0 22px;
  border-radius: 999px;
  font-family: 'Figtree', sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  border: 0;
}

.featured__btn--primary {
  background: #065c5d;
  color: #fff;
}

.featured__btn--primary:hover {
  background: #07979f;
}

.featured__btn--secondary {
  border: 2px solid #cfdde1;
  background: #fff;
  color: #0e2a36;
  padding: 0 20px;
}

.featured__btn--secondary:hover {
  border-color: #07979f;
  color: #07979f;
}

.filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filters__label {
  font-size: 13px;
  font-weight: 700;
  color: #5f767e;
  margin-right: 4px;
}

.filters__chip {
  height: 34px;
  padding: 0 16px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #dde8ea;
  color: #31474f;
  font-family: 'Figtree', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.filters__chip--active {
  background: #065c5d;
  border-color: #065c5d;
  color: #fff;
  font-weight: 700;
}

.filters__sort {
  margin-left: auto;
  font-size: 13px;
  color: #5f767e;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.filters__sort select {
  border: 1px solid #dde8ea;
  border-radius: 999px;
  padding: 4px 10px;
  font-family: 'Figtree', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #0e2a36;
  background: #fff;
}

.books__empty {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  padding: 22px;
  font-size: 14px;
  color: #5f767e;
}

.books__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.book-card {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.book-card__cover {
  aspect-ratio: 3 / 4;
  border-radius: 16px;
  overflow: hidden;
  background: #dbf2f4;
}

.book-card__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-card__cover--placeholder {
  background: #f4f8f9;
  border: 1px dashed #cfdde1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #7d939a;
  font-size: 12px;
  font-weight: 700;
}

.book-card__copy {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.book-card__title {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.book-card__author {
  font-size: 13px;
  color: #5f767e;
}

.book-card__badge {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 11px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.book-card__motive {
  font-size: 13px;
  line-height: 1.5;
  color: #4b5f68;
}

.book-card__link {
  margin-top: auto;
  height: 38px;
  border-radius: 999px;
  border: 2px solid #cfdde1;
  background: #fff;
  font-family: 'Figtree', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #0e2a36;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.book-card__link:hover {
  border-color: #07979f;
  color: #07979f;
}

.review-card {
  background: #dbf2f4;
  border-radius: 24px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
}

.review-card__icon {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.review-card__title {
  font-size: 17px;
  font-weight: 800;
  color: #04494a;
  line-height: 1.3;
}

.review-card__subtitle {
  font-size: 14px;
  line-height: 1.5;
  color: #0b6f70;
}

.review-card__btn {
  margin-top: 4px;
  height: 40px;
  border-radius: 999px;
  border: 0;
  background: #065c5d;
  color: #fff;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.review-card__btn:hover {
  background: #07979f;
}

@media (max-width: 1180px) {
  .books__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 720px) {
  .featured {
    flex-direction: column;
    align-items: stretch;
  }

  .featured__cover {
    width: 120px;
    align-self: center;
  }

  .books__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters__sort {
    margin-left: 0;
    width: 100%;
  }
}
</style>
