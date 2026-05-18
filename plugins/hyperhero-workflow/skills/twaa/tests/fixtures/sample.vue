<template>
  <div>
    <img src="/logo.png" />
    <img src="/photo.jpg" alt="" />
    <button @keydown.escape="close">關閉</button>
    <Teleport to="body">
      <Modal />
    </Teleport>
    <input v-model="email" :aria-required="true" />
    <Dialog :closeOnEscape="false" />
  </div>
</template>

<script setup lang="ts">
const email = ref('')
</script>
