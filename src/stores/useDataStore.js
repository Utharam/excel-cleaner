import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDataStore = defineStore('data', () => {
  const rawData = ref([])
  const fileName = ref(null)
  const headers = ref([])
  const columnTypes = ref({}) // Stores our Text/Date/Amount tags

  const setRawData = (data, name, types = null) => {
    rawData.value = data
    headers.value = Object.keys(data[0] || {})
    fileName.value = name
    if (types) {
      columnTypes.value = types
    }
  }

  const clearData = () => {
    rawData.value = []
    fileName.value = null
    headers.value = []
    columnTypes.value = {}
  }

  return { rawData, fileName, headers, columnTypes, setRawData, clearData }
})