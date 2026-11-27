<script setup lang="ts">
import { useAuthStore } from '~/store/auth'

const authStore = useAuthStore()

const roleLabels: Record<string, string> = {
  KAIROS_ADMIN: 'Administrador KAIROS',
  INSTITUTION_ADMIN: 'Administrador institucional',
  INSTITUTION_STAFF: 'Equipo institucional',
}

const user = computed(() => authStore.user)

const fullName = computed(() => {
  return [user.value?.name, user.value?.lastName, user.value?.surName]
    .filter((value): value is string => Boolean(value))
    .join(' ')
    .trim()
})

const displayName = computed(() => fullName.value || 'Tu perfil KAIROS')

const initials = computed(() => {
  const firstName = user.value?.name?.trim().charAt(0) || ''
  const lastName = user.value?.lastName?.trim().charAt(0) || ''

  return `${firstName}${lastName}`.toUpperCase() || 'K'
})

const roleLabel = computed(() => {
  const [firstRole] = user.value?.roles || []

  if (firstRole === 'STUDENT') return authStore.terms.member
  return firstRole ? roleLabels[firstRole] || formatLabel(firstRole) : 'Usuario'
})

const campusName = computed(() => {
  return (
    user.value?.studentData?.campusInformation?.name ||
    authStore.activeInstitute?.name ||
    `${authStore.terms.site} pendiente`
  )
})

const joinDateLabel = computed(() => formatDate(user.value?.createdAt))

function formatLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatDate(value?: Date | string | number) {
  if (!value) return 'Sin registro'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Sin registro'
  }

  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="profile">
    <header class="profile__header">
      <span class="profile__avatar">{{ initials }}</span>

      <div class="profile__info">
        <span class="profile__name">{{ displayName }}</span>
        <span class="profile__meta">
          {{ user?.email || 'Sin correo registrado' }} · {{ campusName }} · Alta
          el {{ joinDateLabel }}
        </span>

        <div class="profile__badges">
          <span class="profile__badge profile__badge--role">{{
            roleLabel
          }}</span>
        </div>
      </div>

      <div class="profile__actions">
        <NuxtLink to="/user/update-my-data" class="profile__action">
          Editar mis datos
        </NuxtLink>
        <NuxtLink to="/user/history" class="profile__action">
          ver mi historial
        </NuxtLink>
      </div>
    </header>

    <aside class="profile__body">
      <article class="profile__privacy-card">
        <span class="profile__privacy-title">Tu privacidad</span>
        <p class="profile__privacy-text">
          Tu institución ve tendencias agregadas y solo abre tu historial
          clínico si tú lo autorizas o si detectamos un riesgo.
        </p>
        <NuxtLink to="/user/privacy-policy" class="profile__privacy-link">
          Leer el aviso completo →
        </NuxtLink>
      </article>

      <article class="profile__support-card">
        <span class="profile__support-title">Recuerda</span>
        <p class="profile__support-text">
          Tu institución pone a tu disposición especialistas y recursos de apoyo
          para cualquier cosa que necesites.
        </p>
        <NuxtLink to="/user/get-help" class="profile__support-button">
          Contactar ahora
        </NuxtLink>
      </article>
    </aside>
  </div>
</template>

<style scoped>
.profile {
  font-family: 'Figtree', sans-serif;
  color: #0e2a36;
  background: #f4f8f9;
  min-height: 100vh;
  padding: 24px 36px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile__header {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  box-shadow: 0 6px 20px -12px rgba(6, 92, 93, 0.35);
  padding: 28px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.profile__avatar {
  flex-shrink: 0;
  width: 88px;
  height: 88px;
  border-radius: 999px;
  background: #8475a0;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: 800;
}

.profile__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.profile__name {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.profile__meta {
  font-size: 15px;
  color: #5c7078;
}

.profile__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.profile__badge {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.profile__badge--role {
  background: #dbf2f4;
  color: #065c5d;
}

.profile__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.profile__action {
  height: 46px;
  padding: 0 22px;
  border-radius: 999px;
  border: 2px solid #cfdde1;
  background: #fff;
  font-family: 'Figtree', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #0e2a36;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    border-color 0.15s ease,
    color 0.15s ease;
}

.profile__action:hover {
  border-color: #065c5d;
  color: #065c5d;
}

.profile__action:focus-visible {
  outline: 2px solid #065c5d;
  outline-offset: 2px;
}

.profile__body {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  align-items: start;
}

.profile__privacy-card,
.profile__support-card {
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.profile__privacy-card {
  background: #065c5d;
  color: #fff;
}

.profile__privacy-title,
.profile__support-title {
  font-size: 17px;
  font-weight: 800;
}

.profile__privacy-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #c7e9ea;
}

.profile__privacy-link {
  font-size: 14px;
  font-weight: 700;
  color: #6cc5cb;
  text-decoration: none;
}

.profile__privacy-link:hover {
  color: #dbf2f4;
}

.profile__support-card {
  background: #fff;
  border: 1px solid #eaf1f2;
  box-shadow: 0 6px 20px -12px rgba(6, 92, 93, 0.35);
}

.profile__support-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #5c7078;
}

.profile__support-button {
  height: 44px;
  border-radius: 999px;
  border: 0;
  background: #dbf2f4;
  color: #065c5d;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.profile__support-button:hover {
  background: #6cc5cb;
  color: #fff;
}

@media (max-width: 1180px) {
  .profile__body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .profile {
    padding: 20px 18px 40px;
  }

  .profile__header {
    flex-wrap: wrap;
  }

  .profile__actions,
  .profile__action {
    width: 100%;
  }
}
</style>
