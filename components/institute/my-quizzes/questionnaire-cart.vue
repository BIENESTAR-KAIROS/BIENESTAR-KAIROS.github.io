<script setup lang="ts">
import { useQuestionnaireCart } from '~/store/questionnaire-cart'
const props = defineProps<{ floating?: boolean }>()
const cart = useQuestionnaireCart()
const open = ref(false)
const label = computed(
  () => `Abrir carrito de cuestionarios (${cart.items.length})`,
)
watch(
  () => cart.institutionId,
  () => {
    open.value = false
  },
)
</script>
<template>
  <v-dialog
    v-model="open"
    max-width="540"
    aria-labelledby="questionnaire-cart-title"
    scrollable
  >
    <template #activator="{ props: activator }">
      <button
        v-bind="activator"
        type="button"
        class="cart-button"
        :class="{ 'cart-button--floating': props.floating }"
        :aria-label="label"
        :title="label"
      >
        <v-icon aria-hidden="true" icon="mdi-cart-outline" size="24" />
        <span v-if="cart.items.length" class="cart-count" aria-hidden="true">{{
          cart.items.length
        }}</span>
      </button>
    </template>
    <v-card class="cart-panel">
      <header>
        <h2 id="questionnaire-cart-title">Carrito de cuestionarios</h2>
        <v-btn
          icon="mdi-close"
          variant="text"
          aria-label="Cerrar carrito"
          @click="open = false"
        />
      </header>
      <div class="cart-body">
        <p v-if="cart.message" role="status">{{ cart.message }}</p>
        <p v-else-if="!cart.items.length">Tu carrito está vacío.</p>
        <template v-if="cart.items.length">
          <p>
            La referencia sigue la versión global. La copia se puede editar
            desde tu institución.
          </p>
          <div v-for="item in cart.items" :key="item.id" class="cart-row">
            <label
              >{{ item.title
              }}<select v-model="item.mode" :disabled="cart.busy">
                <option value="reference">Referencia</option>
                <option value="copy">Copia institucional</option>
              </select></label
            >
            <v-btn
              icon="mdi-trash-can-outline"
              variant="text"
              :aria-label="'Quitar ' + item.title"
              :disabled="cart.busy"
              @click="cart.items = cart.items.filter((q) => q.id !== item.id)"
            />
          </div>
        </template>
        <p v-if="cart.error" role="alert">{{ cart.error }}</p>
      </div>
      <footer>
        <NuxtLink
          v-if="!cart.items.length"
          :to="
            cart.message ? '/institute/quizzes' : '/institute/quizzes/catalog'
          "
          @click="open = false"
          >{{
            cart.message ? 'Mis cuestionarios' : 'Cuestionarios disponibles'
          }}</NuxtLink
        >
        <v-btn
          v-else
          color="#523f6e"
          rounded
          :loading="cart.busy"
          :disabled="cart.busy"
          @click="cart.checkout()"
          >Agregar a Mis cuestionarios</v-btn
        >
      </footer>
    </v-card>
  </v-dialog>
</template>
<style scoped>
.cart-button {
  display: inline-flex;
  position: relative;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  min-height: 48px;
  color: white;
  border-radius: 50%;
  background: #523f6e;
}
.cart-button--floating {
  position: fixed;
  right: 24px;
  bottom: calc(24px + env(safe-area-inset-bottom));
  z-index: 10;
  width: 56px;
  height: 56px;
  box-shadow: 0 3px 12px #3c2f5240;
}
.cart-count {
  position: absolute;
  right: 0;
  top: 0;
  min-width: 19px;
  border-radius: 1em;
  background: #efebf5;
  color: #3c2f52;
  font:
    700 12px/19px Figtree,
    sans-serif;
}
.cart-panel {
  border-radius: 24px !important;
  color: #3c2f52;
  font-family: Figtree, sans-serif;
}
.cart-panel header,
.cart-panel footer,
.cart-body {
  padding: 16px 22px;
}
.cart-panel header,
.cart-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.cart-panel h2 {
  font-size: 22px;
  line-height: 1.2;
}
.cart-body {
  overflow: auto;
}
.cart-row {
  border-top: 1px solid #ded6ea;
  padding: 14px 0;
  margin-top: 12px;
}
.cart-row label {
  display: grid;
  gap: 8px;
  font-weight: 700;
  min-width: 0;
}
.cart-row select {
  padding: 8px 12px;
  min-height: 44px;
  border: 1px solid #78678c;
  border-radius: 12px;
  background: white;
  color: #3c2f52;
  appearance: auto;
}
.cart-panel footer {
  display: flex;
  justify-content: flex-end;
}
.cart-panel footer a {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  color: #523f6e;
}
.cart-panel :focus-visible,
.cart-button:focus-visible {
  outline: 3px solid #8475a0;
  outline-offset: 3px;
}
</style>
