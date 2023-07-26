<template>
  <v-dialog v-model="dialog" persistent>
    <v-card>
      <v-card-title>{{ item.name }}</v-card-title>
      <v-card-text>{{ item.description }}</v-card-text>
      <v-card-actions>
        <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const dialog = ref(false)
</script>
