<template>
  <el-tooltip :content="$t('cart.buy')" effect="light" :offset="12">
    <div
      class="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-1.5 py-1"
    >
      <Icon name="fa-cart-plus" class="mx-1 text-xs" />
      <a :href="url.personal" target="_blank">
        <HeaderMenu class="!bg-[#4b2ea5]/80 hover:!bg-[#4b2ea5]">
          <Icon name="fa-user" class="text-xs" />
          {{ $t('cart.personal') }}
        </HeaderMenu>
      </a>
      <a :href="url.commercial" target="_blank">
        <HeaderMenu class="!bg-[#752522]/80 hover:!bg-[#752522]">
          <Icon name="fa-users" class="text-xs" />
          {{ $t('cart.commercial') }}
        </HeaderMenu>
      </a>
    </div>
  </el-tooltip>
</template>

<script setup>
const { language } = useNavigatorLanguage();

const url = computed(() => {
  const licenses = {
    CNY: {
      personal: 'https://buy.stripe.com/14k3em76N4J2epabIK',
      commercial: 'https://buy.stripe.com/14keX42QxgrKdl68wz',
    },
    USD: {
      personal: 'https://buy.stripe.com/28o02a3UB1wQ0yk288',
      commercial: 'https://buy.stripe.com/00g02aezfdfy6WI3cg',
    },
  };

  if (language.value?.startsWith('zh')) {
    return licenses.CNY;
  } else {
    return licenses.USD;
  }
});
</script>
