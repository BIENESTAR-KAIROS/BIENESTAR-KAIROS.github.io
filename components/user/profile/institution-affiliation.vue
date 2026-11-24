<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import { useUserStore } from '~/store/user'
import { availableCampuses } from '~/utils/helpers/institution-structure'
import { getApiErrorMessage } from '~/utils/helpers/http-errors'

const props = defineProps<{ onboarding?: boolean }>()
const auth = useAuthStore()
const users = useUserStore()
const campuses = computed(() => availableCampuses(auth.membershipInstitution))
const saved = auth.user?.studentData?.campusInformation
const domain = auth.user?.email?.toLowerCase().split('@')[1]
const suggested = campuses.value.filter(
  (c) => domain && c.emailDomain?.toLowerCase() === domain,
)
const selected = ref(
  campuses.value.find((c) => c.name === saved?.name)?.name ??
    (suggested.length === 1
      ? suggested[0].name
      : campuses.value.length === 1
        ? campuses.value[0].name
        : ''),
)
const manual = ref(!props.onboarding || !selected.value)
const campus = computed(() =>
  campuses.value.find((c) => c.name === selected.value),
)
const options = computed(() =>
  (campus.value?.departments ?? []).flatMap((d) =>
    (d.careers ?? []).map((career) => ({ department: d.name, career })),
  ),
)
const position = ref(
  options.value.findIndex(
    (o) => o.department === saved?.department && o.career === saved?.career,
  ),
)
const busy = ref(false)
const notice = ref('')
const error = ref('')
function changeCampus() {
  position.value = -1
  clearMessages()
}
function clearMessages() {
  notice.value = ''
  error.value = ''
}
async function save() {
  const choice = options.value[position.value]
  if (
    busy.value ||
    !choice ||
    !campus.value ||
    !auth.user ||
    auth.isStudentPreview
  )
    return
  busy.value = true
  error.value = ''
  notice.value = ''
  const id = auth.user._id
  try {
    const result = await users.updateUserStudentData(id, {
      campusInformation: { name: campus.value.name, ...choice },
    })
    if (!result.passed || !result.user?.studentData?.campusInformation)
      throw new Error()
    if (auth.user?._id !== id) return
    auth.user.studentData = result.user.studentData
    if (props.onboarding) await navigateTo('/user/dashboard', { replace: true })
    else notice.value = 'Tus cambios se guardaron.'
  } catch (cause) {
    error.value = getApiErrorMessage(
      cause,
      'No pudimos guardar tus datos. Vuelve a intentarlo.',
    )
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <section v-if="campuses.length && !auth.isStudentPreview" class="affiliation">
    <component :is="onboarding ? 'h1' : 'h2'">{{
      auth.terms.affiliation
    }}</component>
    <p v-if="onboarding">
      Completa estos datos para continuar. Podrás editarlos desde tu perfil.
    </p>
    <form @submit.prevent="save">
      <fieldset :disabled="busy">
        <label v-if="manual"
          >{{ auth.terms.site }}
          <select v-model="selected" required @change="changeCampus">
            <option value="" disabled>Selecciona una opción</option>
            <option v-for="c in campuses" :key="c.name" :value="c.name">
              {{ c.name }}
            </option>
          </select>
        </label>
        <div v-else>
          <strong>{{ auth.terms.site }}</strong> · {{ selected }}
          <button
            v-if="campuses.length > 1"
            type="button"
            class="change"
            @click="manual = true"
          >
            Cambiar
          </button>
        </div>
        <label
          >{{ auth.terms.role }}
          <select
            v-model="position"
            :disabled="!campus"
            @change="clearMessages"
          >
            <option :value="-1" disabled>Selecciona una opción</option>
            <option v-for="(o, index) in options" :key="index" :value="index">
              {{ o.career }} · {{ o.department }}
            </option>
          </select>
        </label>
        <button type="submit" :disabled="!options[position] || !campus">
          {{
            busy
              ? 'Guardando…'
              : onboarding
                ? 'Guardar y continuar'
                : 'Guardar cambios'
          }}
        </button>
      </fieldset>
      <p v-if="error" role="alert">{{ error }}</p>
      <p v-if="notice" role="status">{{ notice }}</p>
    </form>
  </section>
</template>
<style scoped>
.affiliation {
  background: #fff;
  color: #0e2a36;
  border: 1px solid #e3ecee;
  border-radius: 24px;
  padding: clamp(18px, 4vw, 32px);
  font-family: Figtree, sans-serif;
}
fieldset {
  border: 0;
  min-width: 0;
  display: grid;
  gap: 16px;
  margin: 18px 0 0;
}
label {
  display: grid;
  gap: 6px;
  font-weight: 700;
}
select {
  appearance: auto;
  width: 100%;
  min-width: 0;
  background: #f4f8f9;
  border: 1px solid #7c9193;
  border-radius: 12px;
  padding: 10px;
  min-height: 48px;
}
button {
  justify-self: start;
  min-height: 44px;
  border-radius: 24px;
  background: #065c5d;
  color: white;
  padding: 8px 20px;
  font-weight: 700;
}
button:disabled {
  opacity: 0.6;
}
.change {
  background: transparent;
  color: #065c5d;
  text-decoration: underline;
}
:where(button, select):focus-visible {
  outline: 3px solid #065c5d;
  outline-offset: 3px;
}
[role='alert'] {
  color: #8a1c1c;
}
</style>
