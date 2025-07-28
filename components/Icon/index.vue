<template>
  <i class="fa-solid" :class="name" />
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      required: true,
    },
  },
};
</script>
