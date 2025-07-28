<template>
  <el-dialog
    v-model="createStore.online.dialog"
    :destroy-on-close="true"
    :show-close="false"
    width="38rem"
  >
    <template #header>
      <DialogsHeader @close="createStore.online.dialog = false">
        <Icon name="fa-circle-play" class="text-base" />
        {{ $t(`type.video.2`) }}
      </DialogsHeader>
    </template>
    <DialogsCreateOnlineMain />
    <template #footer>
      <DialogsFooter>
        <div class="flex items-center gap-1">
          <el-button
            plain
            :dark="true"
            size="large"
            @click="createStore.online.dialog = false"
          >
            <Icon name="fa-xmark" class="mr-2 text-xs" />
            {{ $t('create.cancel') }}
          </el-button>
          <el-button
            plain
            :dark="true"
            size="large"
            @click="createStore.resetOnlineInfo"
          >
            <Icon name="fa-broom-wide" class="mr-2 text-xs" />
            {{ $t('create.reset') }}
          </el-button>
        </div>
        <el-button
          :disabled="createStore.online.loading || !createStore.online.video"
          color="#3662e3"
          :dark="true"
          size="large"
          @click="createStore.onOnlineConfirm"
        >
          <Icon name="fa-check" class="mr-2 text-base" />
          {{ $t('create.useVideo') }}
        </el-button>
      </DialogsFooter>
    </template>
  </el-dialog>
</template>

<script setup>
const createStore = useCreateStore();
</script>
