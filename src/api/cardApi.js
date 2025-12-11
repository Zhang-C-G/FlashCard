import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

/**
 * Card API - Communication avec le serveur Express
 */
export const cardApi = {
  /**
   * Get all cards
   */
  async getAll() {
    const response = await axios.get(`${API_URL}/cards`)
    return response.data
  },

  /**
   * Get due cards
   */
  async getDue() {
    const response = await axios.get(`${API_URL}/cards/due`)
    return response.data
  },

  /**
   * Get card by ID
   */
  async getById(id) {
    const response = await axios.get(`${API_URL}/cards/${id}`)
    return response.data
  },

  /**
   * Create a new card
   */
  async create(cardData) {
    const response = await axios.post(`${API_URL}/cards`, cardData)
    return response.data
  },

  /**
   * Update a card
   */
  async update(id, cardData) {
    const response = await axios.put(`${API_URL}/cards/${id}`, cardData)
    return response.data
  },

  /**
   * Delete a card
   */
  async delete(id) {
    await axios.delete(`${API_URL}/cards/${id}`)
    return true
  }
}
