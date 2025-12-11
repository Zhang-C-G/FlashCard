<script setup>
import { useCardStore } from '@/stores/cardStore'

// Initialize store
const cardStore = useCardStore()
</script>

<template>
  <div id="app">
    <!-- Navigation -->
    <nav class="main-nav">
      <div class="nav-brand">
        <span class="logo">🎴</span>
        <span class="title">C-Carte</span>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">📚 Réviser</router-link>
        <router-link to="/add" class="nav-link">➕ Ajouter</router-link>
        <router-link to="/manage" class="nav-link">📋 Gérer</router-link>
      </div>
      <div class="nav-stats">
        <span class="stat">{{ cardStore.stats.total }} cartes</span>
      </div>
    </nav>

    <!-- Main content -->
    <router-view />
  </div>
</template>

<style>
/* Navigation - Uses global CSS variables */
.main-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-xl);
  background: var(--color-bg-white);
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.nav-brand .logo {
  font-size: var(--text-2xl);
}

.nav-brand .title {
  font-size: var(--text-xl);
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  gap: var(--space-md);
}

.nav-link {
  padding: var(--space-sm) var(--space-md);
  text-decoration: none;
  color: var(--color-text-muted);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.nav-link:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.nav-link.router-link-active {
  background: var(--gradient-primary);
  color: white;
}

.nav-stats {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
</style>
