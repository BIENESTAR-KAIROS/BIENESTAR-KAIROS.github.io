<script setup lang="ts">
const meditations = [
  {
    description:
      'Un espacio donde registras regularmente lo que agradeces para entrenar tu mente a enfocarse en lo positivo, mejorar tu bienestar emocional y transformar tu perspectiva de vida.',
    link: 'https://www.youtube.com/watch?v=POj_coOBUBs',
  },
  {
    description:
      'En esta meditación guiada para la ansiedad y las emociones negativas vamos a realizar 15 minutos mágicos que te aportarán paz y calma mental además de eliminar el estrés, la ansiedad y los pensamientos negativos. Es perfecta si estás pasando un momento difícil, si acabas de sufrir una pérdida o estás pasando por un duelo, si experimentas depresión o si simplemente estás teniendo un mal día y quieres sentirte mejor al instante.',
    link: 'https://youtu.be/aBsnQjJ2_Nk?si=I429sLy7sD_yA2lS',
  },
]

const tips = [
  'Un lugar donde nadie te interrumpa unos minutos.',
  'Siéntate con la espalda apoyada; no hace falta el suelo.',
  'Si te distraes, no pasa nada: vuelve a la voz.',
]

function embedUrl(link: string): string {
  const match = link.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  const videoId = match?.[1]
  return videoId ? `https://www.youtube.com/embed/${videoId}` : link
}

const featured = meditations[0]
const rest = meditations.slice(1)
</script>

<template>
  <div class="meditations">
    <div class="meditations__intro">
      <span class="meditations__title">Meditaciones guiadas</span>
      <span class="meditations__subtitle">
        Con base en la información que nos has proporcionado en tus
        cuestionarios, tenemos algunas recomendaciones de prácticas aprobadas
        por nuestros especialistas que te ayudarán a mejorar tu bienestar.
      </span>
    </div>

    <div v-if="featured" class="featured">
      <div class="featured__player">
        <iframe
          :src="embedUrl(featured.link)"
          title="Meditación 1"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        />
      </div>
      <div class="featured__body">
        <span class="featured__tag">Meditación 1</span>
        <span class="featured__description">{{ featured.description }}</span>
      </div>
    </div>

    <div class="tips">
      <span class="tips__label">Antes de empezar</span>
      <div class="tips__list">
        <div v-for="(tip, i) in tips" :key="i" class="tips__item">
          <span class="tips__number">{{ i + 1 }}</span>
          <span>{{ tip }}</span>
        </div>
      </div>
    </div>

    <div v-if="rest.length > 0" class="meditations__grid">
      <div
        v-for="(meditation, i) in rest"
        :key="i"
        class="meditation-card"
      >
        <div class="meditation-card__player">
          <iframe
            :src="embedUrl(meditation.link)"
            :title="`Meditación ${i + 2}`"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          />
        </div>
        <span class="meditation-card__title">Meditación {{ i + 2 }}</span>
        <span class="meditation-card__description">
          {{ meditation.description }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.meditations {
  padding: 30px 36px 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.meditations__intro {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meditations__title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.meditations__subtitle {
  font-size: 15px;
  color: #4b5f68;
  max-width: 720px;
  line-height: 1.6;
}

.featured {
  background: #065c5d;
  border-radius: 28px;
  padding: 28px;
  display: grid;
  grid-template-columns: minmax(320px, 520px) 1fr;
  gap: 28px;
  color: #fff;
  align-items: center;
}

.featured__player {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 20px;
  overflow: hidden;
  background: #04333a;
}

.featured__player iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.featured__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.featured__tag {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 13px;
  border-radius: 999px;
  background: #6cc5cb;
  color: #04333a;
  font-size: 12px;
  font-weight: 800;
}

.featured__description {
  font-size: 15px;
  line-height: 1.6;
  color: #dff1f1;
}

.tips {
  background: #fff;
  border: 1px solid #eaf1f2;
  border-radius: 22px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.tips__label {
  font-size: 14px;
  font-weight: 800;
  flex: 0 0 auto;
}

.tips__list {
  flex: 1;
  display: flex;
  gap: 22px;
  flex-wrap: wrap;
}

.tips__item {
  flex: 1;
  min-width: 200px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 14px;
  line-height: 1.5;
  color: #4b5f68;
}

.tips__number {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  border-radius: 999px;
  background: #dbf2f4;
  color: #065c5d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
}

.meditations__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.meditation-card {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meditation-card__player {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  overflow: hidden;
  background: #eef4f5;
}

.meditation-card__player iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.meditation-card__title {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.01em;
  padding: 0 6px;
}

.meditation-card__description {
  font-size: 14px;
  line-height: 1.55;
  color: #4b5f68;
  padding: 0 6px;
}

@media (max-width: 1180px) {
  .featured {
    grid-template-columns: 1fr;
  }

  .meditations__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 720px) {
  .meditations {
    padding: 20px 18px 40px;
  }

  .tips__item {
    min-width: 100%;
  }

  .meditations__grid {
    grid-template-columns: 1fr;
  }
}
</style>
