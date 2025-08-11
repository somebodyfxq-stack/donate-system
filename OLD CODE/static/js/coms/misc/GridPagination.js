import PropTypes from 'prop-types';
import React from 'react';

function GridPagination({page, size, total, isSearchOn, onPageChange}) {
	if (total === 0 || isSearchOn) {
		return null;
	}

	const totalPages = Math.ceil(total / size);
	const currentPage = page + 1;
	const pages = [];
	const maxVisiblePages = 1; // Number of pages to the left and right of the current page

	// Add first page
	if (currentPage >= 1 && total > size) {
		pages.push(1);
	}

	// Intermediate pages
	for (let i = Math.max(2, currentPage - maxVisiblePages); i <= Math.min(totalPages - 1, currentPage + maxVisiblePages); i++) {
		pages.push(i);
	}

	// Add last page
	if (currentPage <= totalPages && total > size) {
		pages.push(totalPages);
	}

	return <div className="pagination d-flex align-items-center justify-content-center mt-3">
		{pages.map((page, index) => {
			const showDots = index > 0 && page > pages[index - 1] + 1;

			return <React.Fragment key={page}>
				{showDots && <span className="dots">...</span>}
				<button className={`page-btn ${currentPage === page ? 'active' : ''}`}
						onClick={() => onPageChange(page - 1)}>
					{page}
				</button>
			</React.Fragment>;
		})}
	</div>;
}

export default GridPagination;

GridPagination.propTypes = {
	page: PropTypes.number.isRequired,
	size: PropTypes.number.isRequired,
	total: PropTypes.number.isRequired,
	isSearchOn: PropTypes.bool,
	onPageChange: PropTypes.func.isRequired
};
