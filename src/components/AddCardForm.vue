<script setup>
import { ref, computed } from 'vue'
import { useCardStore } from '@/stores/cardStore'

const cardStore = useCardStore()

const emit = defineEmits(['added', 'cancel'])

// Form data
const form = ref({
  front: '',
  back: '',
  hint: '',
  category: 'default',
  tagsInput: ''
})

const error = ref('')
const success = ref(false)

const categories = computed(() => cardStore.categories)

function parseTags(input) {
  return input ? input.split(',').map(t => t.trim()).filter(t => t) : []
}

function handleSubmit() {
  error.value = ''
  success.value = false
  
  try {
    const cardData = {
      front: form.value.front.trim(),
      back: form.value.back.trim(),
      hint: form.value.hint.trim(),
      category: form.value.category || 'default',
      tags: parseTags(form.value.tagsInput)
    }
    
    cardStore.addCard(cardData)
    success.value = true
    
    // Reset form
    form.value = {
      front: '',
      back: '',
      hint: '',
      category: form.value.category,
      tagsInput: ''
    }
    
    emit('added')
    
    setTimeout(() => { success.value = false }, 2000)
  } catch (e) {
    error.value = e.message
  }
}

function cancel() {
  emit('cancel')
}
</script>

<template>
  <div class="add-card-form">
    <h2>➕ Ajouter une carte</h2>
    
    <form @submit.prevent="handleSubmit">
      <!-- Category -->
      <div class="form-group">
        <label for="category">Catégorie</label>
        <input 
          id="category"
          v-model="form.category"
          type="text"
          list="categories"
          placeholder="Ex: Japonais, Maths..."
        />
        <datalist id="categories">
          <option v-for="cat in categories" :key="cat" :value="cat" />
        </datalist>
      </div>

      <!-- Front -->
      <div class="form-group">
        <label for="front">Recto * (question)</label>
        <textarea 
          id="front"
          v-model="form.front"
          required
          rows="3"
          placeholder="Ex: 本 (ほん)"
        />
      </div>

      <!-- Back -->
      <div class="form-group">
        <label for="back">Verso * (réponse)</label>
        <textarea 
          id="back"
          v-model="form.back"
          required
          rows="3"
          placeholder="Ex: Livre"
        />
      </div>

      <!-- Hint -->
      <div class="form-group">
        <label for="hint">Indice (optionnel)</label>
        <input 
          id="hint"
          v-model="form.hint"
          type="text"
          placeholder="Ex: hon"
        />
      </div>

      <!-- Tags -->
      <div class="form-group">
        <label for="tags">Tags (séparés par virgule)</label>
        <input 
          id="tags"
          v-model="form.tagsInput"
          type="text"
          placeholder="Ex: N5, vocabulaire"
        />
      </div>

      <!-- Error / Success -->
      <div v-if="error" class="message error">❌ {{ error }}</div>
      <div v-if="success" class="message success">✅ Carte ajoutée !</div>

      <!-- Buttons -->
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="cancel">
          Annuler
        </button>
        <button type="submit" class="btn btn-primary">
          Ajouter la carte
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.add-card-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #667eea;
}

textarea {
  resize: vertical;
}

.message {
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.error {
  background: #fee;
  color: #c00;
}

.success {
  background: #efe;
  color: #060;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn:hover {
  transform: scale(1.02);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}
</style>
