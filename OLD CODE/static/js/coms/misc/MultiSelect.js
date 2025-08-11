import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import '../../css/multi-select.css';

const MultiSelect = ({ items, initialSelectedItems, handleSelectChange, placeholder }) => {
	const [selectedItems, setSelectedItems] = useState(initialSelectedItems);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef(null);

	useEffect(() => {
		handleSelectChange(selectedItems);
	}, [selectedItems]);  // eslint-disable-line react-hooks/exhaustive-deps

	const toggleItem = useCallback((item) => {
		setSelectedItems((prevSelectedItems) => {
			if (prevSelectedItems.some((i) => i.id === item.id)) {
				return prevSelectedItems.filter((i) => i.id !== item.id);
			} else {
				return [...prevSelectedItems, item];
			}
		});
	}, [setSelectedItems]);

	const selectAllItems = useCallback(() => {
		if (selectedItems.length === items.length) {
			setSelectedItems([]);
		} else {
			setSelectedItems(items);
		}
	}, [items, selectedItems, setSelectedItems]);

	const convertColorToRGB = useCallback((color) => {
		const red = (color >> 16) & 255;
		const green = (color >> 8) & 255;
		const blue = color & 255;
		return `rgb(${red}, ${green}, ${blue})`;
	}, []);

	const handleClickOutside = useCallback((event) => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
			setIsDropdownOpen(false);
		}
	}, []);

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [handleClickOutside]);

	const selectedRolesDisplay = useMemo(() => (
		selectedItems.map((item) => (
			<div key={item.id} className="item-tag">
				{item.color && <span className="item-color" style={{ background: convertColorToRGB(item.color) }}></span>}
				<span>{item.type ? item.type + " - " : ''}{item.title}</span>
				<span
					className="close-icon"
					onClick={(e) => {
						e.stopPropagation();
						toggleItem(item);
					}}
					title='Видалити'
				>
					<i className="fa-solid fa-xmark" style={{ fontSize: '16px' }}></i>
				</span>
			</div>
		))
	), [selectedItems, toggleItem, convertColorToRGB]);

	return (
		<div className="multi-select" ref={dropdownRef}>
			<div
				className={`selected-items ${isDropdownOpen ? 'open' : ''}`}
				onClick={() => setIsDropdownOpen(!isDropdownOpen)}
			>
				{selectedItems.length > 0 ? (
					selectedRolesDisplay
				) : (
					<span className="placeholder">{placeholder}</span>
				)}
			</div>

			{isDropdownOpen && (
				<div className="dropdown">
					<div className="dropdown-container">
						{items.length >= 5 && (
							<>
								<div className="dropdown-item-multi-select py-2">
									<input
										id='selectAllItems'
										type="checkbox"
										checked={selectedItems.length === items.length}
										onChange={selectAllItems}
									/>
									<label htmlFor='selectAllItems' className='w-100 pointer'>Обрати всі</label>
								</div>
								<div className='border-bottom pb-2 mb-2'></div>
							</>
						)}
						{items.map((item) => (
								<div key={item.id} className="dropdown-item-multi-select">
									<input
										id={item.id}
										type="checkbox"
										checked={selectedItems.some((i) => i.id === item.id)}
										onChange={() => toggleItem(item)}
									/>
									<label htmlFor={item.id} className='w-100 pointer'>
										<div className="item-tag ml-3">
											{item.color && <span className="item-color" style={{ background: convertColorToRGB(item.color) }}></span>}
											<span>{item.type ? item.type + " - " : ''}{item.title}</span>
										</div>
									</label>
								</div>
							)
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default MultiSelect;
