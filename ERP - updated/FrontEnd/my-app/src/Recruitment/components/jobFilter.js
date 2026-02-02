
// import React, { useState } from "react";
// import FilterBar from "../utils/FiltersBar";
// import { applyFilter } from "./applyFilter";
// import { filters } from "../config/filterConfig";

// const JobFilter = ({ jobs, setFilteredJobs }) => {
//   const [selectedFilters, setSelectedFilters] = useState([]);

//   // Toggle filter selection (Checkbox)
//   const handleFilterToggle = (filter) => {
//     setSelectedFilters((prevFilters) => {
//       const isFilterSelected = prevFilters.some((f) => f.filter === filter);
  
//       if (isFilterSelected) {
//         // Remove the filter if unchecked
//         return prevFilters.filter((f) => f.filter !== filter);
//       } else {
//         // Add new filter with empty option & value
//         return [...prevFilters, { filter, option: "", value: "" }];
//       }
//     });
//   };
  

//   // Handle condition change
//   const handleOptionChange = (filter, event) => {
//     setSelectedFilters((prevFilters) => {
//       // Find the existing filter object
//       const existingFilter = prevFilters.find((f) => f.filter === filter);
  
//       if (existingFilter) {
//         // Update the existing filter's option
//         return prevFilters.map((f) =>
//           f.filter === filter ? { ...f, option: event.target.value, value: "" } : f
//         );
//       } else {
//         // If filter does not exist, create a new one
//         return [...prevFilters, { filter, option: event.target.value, value: "" }];
//       }
//     });
//   };
  

//   // Handle input value change
//   const handleValueChange = (filter, event) => {
//     setSelectedFilters((prevFilters) => {
//       // Find the existing filter object
//       const existingFilter = prevFilters.find((f) => f.filter === filter);
  
//       if (existingFilter) {
//         // Update the existing filter's value
//         return prevFilters.map((f) =>
//           f.filter === filter ? { ...f, value: event.target.value } : f
//         );
//       } else {
//         // If filter does not exist, create a new one with an empty option
//         return [...prevFilters, { filter, option: "", value: event.target.value }];
//       }
//     });
//   };
  

//   // Apply all selected filters
//   const handleApplyFilters = () => {
//     let filteredJobs = jobs;
//     selectedFilters.forEach(({ filter, option, value }) => {
//       filteredJobs = applyFilter(filteredJobs, filter, option, value);
//     });
//     setFilteredJobs(filteredJobs);
//   };

//   return (
//     <FilterBar
//       availableFilters={filters}
//       selectedFilters={selectedFilters}
//       handleFilterToggle={handleFilterToggle}
//       handleOptionChange={handleOptionChange}
//       handleValueChange={handleValueChange}
//       handleApplyFilters={handleApplyFilters}
//     />
//   );
// };

// export default JobFilter;\


import React, { useState } from "react";
import FilterBar from "../utils/FiltersBar";
import { applyFilter } from "./applyFilter";
import { filters } from "../config/filterConfig";

const JobFilter = ({ jobs, setFilteredJobs, onApplyFilters }) => {
  const [selectedFilters, setSelectedFilters] = useState([]);

  // Toggle filter selection (Checkbox)
  const handleFilterToggle = (filter) => {
    setSelectedFilters((prevFilters) => {
      return prevFilters.some((f) => f.filter === filter)
        ? prevFilters.filter((f) => f.filter !== filter) // Remove filter if unchecked
        : [...prevFilters, { filter, option: "", value: "" }];
    });
  };

  // Handle condition change
  const handleOptionChange = (filter, event) => {
    setSelectedFilters((prevFilters) =>
      prevFilters.map((f) =>
        f.filter === filter ? { ...f, option: event.target.value, value: "" } : f
      )
    );
  };

  // Handle input value change
  const handleValueChange = (filter, event) => {
    setSelectedFilters((prevFilters) =>
      prevFilters.map((f) =>
        f.filter === filter ? { ...f, value: event.target.value } : f
      )
    );
  };

  // Apply filters
  const handleApplyFilters = () => {
    let filteredJobs = jobs || []; // Ensure jobs is an array
    selectedFilters.forEach(({ filter, option, value }) => {
      filteredJobs = applyFilter(filteredJobs, filter, option, value, "job");
    });

    setFilteredJobs(filteredJobs);
    if (onApplyFilters) onApplyFilters(filteredJobs);
  };

  return (
    <FilterBar
      availableFilters={filters}
      selectedFilters={selectedFilters}
      handleFilterToggle={handleFilterToggle}
      handleOptionChange={handleOptionChange}
      handleValueChange={handleValueChange}
      handleApplyFilters={handleApplyFilters}
    />
  );
};

export default JobFilter;

