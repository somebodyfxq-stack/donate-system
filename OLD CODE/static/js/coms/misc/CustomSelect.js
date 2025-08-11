import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

function SelectComponent({ options, value, setSelectItem, id }) {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedOption, setSelectedOption] = useState(value.label);
	const [selectedItemId, setSelectedItemId] = useState(value.id)
	const selectRef = useRef(null);

	const toggleSelect = useCallback(() => {
		setIsOpen(prevIsOpen => !prevIsOpen);
	}, []);

	const selectItem = useCallback(
		(item) => {
			setIsOpen(false);
			setSelectedOption(item.label);
			setSelectedItemId(item.id);
			setSelectItem(item.id, id);

			// Clear the previous selected item
			const previouslySelected = document.querySelector('.select-item.selected-item');
			if (previouslySelected) {
				previouslySelected.classList.remove('selected-item');
			}

			// Mark the newly selected item with a check mark
			const selectedItemElement = document.querySelector(`[data-item-id="${item.id}"]`);
			if (selectedItemElement) {
				selectedItemElement.classList.add('selected-item');
			}
		},
		[setSelectItem, id]
	);


	const handleDocumentClick = useCallback(e => {
		if (selectRef.current && !selectRef.current.contains(e.target)) {
			setIsOpen(false);
		}
	}, []);

	useEffect(() => {
		document.addEventListener('click', handleDocumentClick);

		return () => {
			document.removeEventListener('click', handleDocumentClick);
		};
	}, [handleDocumentClick]);

	const memoizedOptions = useMemo(() => options, [options]);

	return (
		<div className="select-custom" ref={selectRef}>
			<div className={`select-head ${isOpen ? 'open' : ''}`} onClick={toggleSelect}>
				{selectedOption || memoizedOptions[0].label}
			</div>
			{isOpen && (
				<ul className="select-list">
					{memoizedOptions.map(item => (
						<li
							key={item.id}
							data-item-id={item.id}
							className={`d-flex justify-content-between select-item ${selectedItemId ? 'selected-item' : ''}`}
							onClick={() => selectItem(item)}
						>
							{item.label}
							{item.id === selectedItemId && (
								<span className="check-mark">✔</span>
							)}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export default SelectComponent;
