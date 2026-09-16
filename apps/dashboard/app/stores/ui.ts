export const useUiStore = defineStore('ui', () => {
  const vehicleSearch = ref('');
  const vehicleStatus = ref('');
  const integrationStatus = ref('');

  return { vehicleSearch, vehicleStatus, integrationStatus };
});
