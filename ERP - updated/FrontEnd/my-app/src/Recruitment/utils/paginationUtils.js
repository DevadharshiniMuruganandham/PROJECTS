// paginationUtils.js
export const generatePageNumbers = (currentPage, totalPages) => {
    const pages = [];
    const maxPagesToShow = 5;
  
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };
  
  // Rows Per Page Selector Component
  export const RowsPerPageSelector = ({ rowsPerPage, setRowsPerPage }) => {
    return (
      <div className="rows-per-page-selector">
        <label>Rows per page:</label>
        <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
    );
  };
  