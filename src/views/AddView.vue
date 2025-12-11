<script setup>
import { useRouter } from 'vue-router'
import AddCardForm from '@/components/AddCardForm.vue'

const router = useRouter()

function handleAdded() {
  // Stay on page to add more cards
}

function handleCancel() {
  router.push('/manage')
}
</script>

<template>
  <div class="add-view">
    <header class="view-header">
      <router-link to="/" class="back-link">← Retour</router-link>
      <h1>Ajouter une carte</h1>
    </header>

    <main class="view-content">
      <AddCardForm @added="handleAdded" @cancel="handleCancel" />
    </main>
  </div>
</template>

<style scoped>
.add-view {
  min-height: 100vh;
  background: #f5f7fa;
}

.view-header {
  padding: 1.5rem 2rem;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.back-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
}

.view-header h1 {
  margin: 0.5rem 0 0;
  font-size: 1.5rem;
}

.view-content {
  padding: 2rem;
}
</style>
