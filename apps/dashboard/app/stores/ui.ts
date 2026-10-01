export const useUiStore = defineStore('ui', () => {
  const vehicleSearch = ref('');
  const vehicleStatus = ref('');
  const vehicleType = ref('');
  const vehicleCity = ref('');
  const integrationStatus = ref('');
  const integrationCorrelationId = ref('');

  function resetVehicleFilters() {
    vehicleSearch.value = '';
    vehicleStatus.value = '';
    vehicleType.value = '';
    vehicleCity.value = '';
  }

  return {
    vehicleSearch,
    vehicleStatus,
    vehicleType,
    vehicleCity,
    resetVehicleFilters,
    integrationStatus,
    integrationCorrelationId,
  };
});
