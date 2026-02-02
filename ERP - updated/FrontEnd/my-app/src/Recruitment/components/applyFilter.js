import { jobFilterFieldMapping } from "../config/filterConfig";
import { clientFilterFieldMapping } from "../config/ClientConfig";

export const applyFilter = (items = [], selectedFilter, selectedOption, searchValue, filterType) => {
  if (!Array.isArray(items)) {
    console.error("applyFilter: 'items' is not an array", items);
    return []; // Prevent crashes
  }

  if (!selectedFilter || !searchValue) return items;

  const filterFieldMapping = filterType === "job" ? jobFilterFieldMapping : clientFilterFieldMapping;
  if (!filterFieldMapping) {
    console.error("applyFilter: Invalid filterType:", filterType);
    return items;
  }

  const fieldKey = filterFieldMapping[selectedFilter] || selectedFilter;

  return items.filter((item) => {
    const fieldValue = item[fieldKey] ? item[fieldKey].toString().toLowerCase() : "";
    const searchLower = searchValue.toString().toLowerCase();

    if (!fieldValue) return false;

    switch (selectedOption) {
      case "is": return fieldValue === searchLower;
      case "isn't": return fieldValue !== searchLower;
      case "contains": return fieldValue.includes(searchLower);
      case "doesn't contain": return !fieldValue.includes(searchLower);
      case "starts with": return fieldValue.startsWith(searchLower);
      case "ends with": return fieldValue.endsWith(searchLower);
      default: return true;
    }
  });
};
