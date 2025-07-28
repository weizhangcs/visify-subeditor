<template>
  <div
    class="group/split absolute -left-1.5 bottom-0 top-0 flex h-full w-3 cursor-col-resize select-none justify-center"
    @mousedown="onMouseDown"
  >
    <div
      class="h-full w-[1px] bg-[#d1b7fa] transition duration-300"
      :class="
        grabbing ? 'opacity-100' : 'opacity-0 group-hover/split:opacity-100'
      "
    />
  </div>
</template>

<script setup>
const appStore = useAppStore();
const grabbing = ref(false);
const cacheX = ref(0);
const cacheSplit = ref(0);
const width = ref(0);

function onMouseDown(event) {
  if (event.button !== 0) return;
  grabbing.value = true;
  const { clientWidth } = document.querySelector('#main');
  width.value = clientWidth;
  cacheX.value = event.pageX;
  cacheSplit.value = appStore.option.splitX;
}

useEventListener(document, 'mousemove', (event) => {
  if (!grabbing.value) return;
  const split = (event.pageX - cacheX.value) / width.value + cacheSplit.value;
  if (split < 0.7 && split > 0.3) {
    appStore.option.splitX = split;
  }
});

useEventListener(document, 'mouseup', () => {
  grabbing.value = false;
  cacheX.value = 0;
  width.value = 0;
});

watchEffect(() => {
  if (typeof document === 'undefined') return;
  if (grabbing.value) {
    document.body.classList.add('select-none');
  } else {
    document.body.classList.remove('select-none');
  }
});
</script>
