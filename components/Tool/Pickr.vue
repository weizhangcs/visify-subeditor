<template>
  <div ref="pickrRef" />
</template>

<script setup>
import Pickr from '@simonwep/pickr';

const pickr = ref(null);
const pickrRef = ref(null);

const emit = defineEmits(['change']);

const props = defineProps({
  color: {
    type: String,
    default: '#fff',
  },
});

function init() {
  pickr.value = Pickr.create({
    el: pickrRef.value,
    theme: 'monolith',
    default: props.color,
    autoReposition: true,
    lockOpacity: true,
    comparison: true,
    swatches: [
      '#FF0000',
      '#00FF00',
      '#0000FF',
      '#FFFF00',
      '#00FFFF',
      '#FF00FF',
      '#FFFFFF',
      '#000000',
      '#FFA500',
      '#FFC0CB',
      '#800080',
      '#A52A2A',
      '#ADD8E6',
      '#006400',
    ],
    components: {
      preview: false,
      opacity: false,
      hue: true,
      interaction: {
        hex: false,
        rgba: false,
        hsva: false,
        input: false,
        clear: false,
        save: false,
      },
    },
  });

  pickr.value.on('change', (color) => {
    pickr.value.applyColor();
    const rgba = color.toRGBA();
    emit('change', {
      r: Math.round(rgba[0]),
      g: Math.round(rgba[1]),
      b: Math.round(rgba[2]),
      a: rgba[3],
    });
  });
}

onMounted(() => {
  init();
});

onBeforeUnmount(() => {
  pickr.value?.destroyAndRemove();
});

watch(
  () => props.color,
  (color) => {
    pickr.value?.setColor?.(color);
  },
);
</script>

<style lang="scss">
.pickr {
  width: 32px;
  height: 16px;
  margin-top: -4px;
  .pcr-button {
    width: 32px;
    height: 16px;
    border: 1px solid #ffffff50;
  }
}

.pcr-app {
  padding: 8px !important;
  background-color: #1d1e23;
  border: 1px solid #ffffff20;
  border-radius: 4px;

  .pcr-swatches {
    justify-content: space-between;
  }
}
</style>
