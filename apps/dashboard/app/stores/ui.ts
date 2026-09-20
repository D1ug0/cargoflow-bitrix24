export const useUiStore = defineStore('ui', () => {
  const vehicleSearch = ref('');
  const vehicleStatus = ref('');
  const integrationStatus = ref('');
  const integrationCorrelationId = ref('');

  return { vehicleSearch, vehicleStatus, integrationStatus, integrationCorrelationId };
});
