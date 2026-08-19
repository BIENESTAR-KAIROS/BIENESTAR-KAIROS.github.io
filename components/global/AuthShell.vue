<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description: string
    institution?: string
  }>(),
  {
    institution: 'SIATSA · Bienestar Kairos',
  },
)
</script>

<template>
  <section class="auth-shell">
    <div class="auth-shell__container">
      <div class="auth-shell__shell">
        <section class="auth-shell__promo">
          <div class="auth-shell__brand">
            <v-img
              src="public/logo-white.png"
              width="110"
              height="110"
              alt="Kairos"
            />
          </div>

          <div class="auth-shell__copy">
            <h1>{{ title }}</h1>
            <p>{{ description }}</p>
          </div>

          <p class="auth-shell__institution">{{ institution }}</p>
        </section>

        <section class="auth-shell__form-column">
          <slot />
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.auth-shell {
  min-height: 100vh;
  padding: 40px 24px;
  background: rgb(231, 236, 238);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Figtree', sans-serif;
}

.auth-shell__container {
  width: min(100%, 1180px);
}

.auth-shell__shell {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 18px 40px -12px rgba(6, 92, 93, 0.28);
  overflow: hidden;
}

.auth-shell__promo {
  min-height: 620px;
  padding: 48px;
  background: rgb(6, 92, 93);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 40px;
}

.auth-shell__brand {
  width: 110px;
}

.auth-shell__copy {
  max-width: 30rem;
}

.auth-shell__copy h1 {
  margin: 0 0 24px;
  color: #fff;
  font-size: clamp(2.25rem, 4vw, 3.8rem);
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -0.04em;
}

.auth-shell__copy p {
  margin: 0;
  color: rgba(255, 255, 255, 0.92);
  font-size: 1.125rem;
  line-height: 1.55;
}

.auth-shell__institution {
  margin: 0;
  color: rgb(127, 196, 197);
  font-size: 0.875rem;
  line-height: 1.4;
}

.auth-shell__form-column {
  padding: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(
      circle at top right,
      rgba(108, 197, 203, 0.16),
      transparent 38%
    ),
    linear-gradient(180deg, rgba(246, 252, 252, 0.88), #fff 42%);
}

@media (max-width: 960px) {
  .auth-shell {
    padding: 24px 16px;
  }

  .auth-shell__shell {
    grid-template-columns: 1fr;
  }

  .auth-shell__promo {
    min-height: auto;
    padding: 30px;
    gap: 15px;
  }

  .auth-shell__form-column {
    padding: 24px 20px 32px;
  }
}

@media (max-width: 600px) {
  .auth-shell__promo {
    padding: 28px 24px;
  }

  .auth-shell__copy h1 {
    font-size: 2.3rem;
  }

  .auth-shell__copy p {
    font-size: 1rem;
  }
}
</style>
