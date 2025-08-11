import React, {useCallback, useEffect, useState} from 'react';
import {UPLOAD_LIMIT} from '../../utils/useFileInteraction';
import TenorGifSearch from '../misc/TenorGifSearch';

import '../../css/modalMedia.css';

let PREV_INDEX = null;
let isSelectButtonDisabled = true;

const MediaModal = ({
  saveSelectedMedia,
  items,
  multiselect,
  uploadHandler,
  removeFile,
  showUpload,
  selected = 'selected',
  selectedItems,
  rowOpened,
  alreadyUploaded,
}) => {
  const [selectedImages, onSelectImages] = useState(false);
  const [tabSelected, onSelectTab] = useState('images');
  const [buttonDisabled, onButtonDisabled] = useState(false);
  const [selectedGif, setSelectedGif] = useState(null);
  const [showStandardImages, setShowStandardImages] = useState(true);

  const lastSelectedTenorGifFromStore = JSON.parse(localStorage.getItem("lastSelectedTenorGif"));
  let lastSelectedTenorGif = null;

  if (lastSelectedTenorGifFromStore) {
    const { id, content_description: name, media_formats: { gif: { url: path } } } = lastSelectedTenorGifFromStore;

    lastSelectedTenorGif = {
      id,
      name,
      path
    };
  }

  useEffect(() => {
    const imagesArray = items.images;
    if (lastSelectedTenorGif && imagesArray.length > 0) {
      imagesArray.unshift(lastSelectedTenorGif);
    }
    if (lastSelectedTenorGif && imagesArray.length > 0 && imagesArray[0].id === imagesArray[1].id) {
      imagesArray.splice(0, 1);
    }
  }, [items.images, lastSelectedTenorGif])

  useEffect(() => {
    if (rowOpened) {
      onButtonDisabled(!buttonDisabled);
      onSelectTab(rowOpened);
    }

    return () => {
      isSelectButtonDisabled = true;
      PREV_INDEX = null;
    }
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  const onRemoveFile = useCallback((e, name, tabSelected) => {
    e.stopPropagation();

    removeFile(name, tabSelected);
  }, [removeFile])

  useEffect(() => {
    if (!selectedItems) return

    if (selected === 'selected') {
      items.sounds.forEach(s => s[selected] = false);
      items.images.forEach(s => s[selected] = false);
    }

    selectedItems.sounds && selectedItems.sounds.forEach(s => {
      items.sounds.forEach(is => {
        if (s === is.id || s === is._id) {
          is[selected] = true;
        }
        return is;
      })
    })

    selectedItems.images && selectedItems.images.forEach(i => {
      items.images.forEach(is => {
        if (i === is.id || i === is._id) {
          is[selected] = true;
        }
        return is;
      })
    })

    onSelectImages(!selectedImages);
  }, [selectedItems, items])// eslint-disable-line react-hooks/exhaustive-deps

  const markSelected = useCallback((i) => {
    if (multiselect) {
      items[tabSelected][i][selected] = !items[tabSelected][i][selected];
    } else {
      if (PREV_INDEX) {
        items[tabSelected][PREV_INDEX][selected] = false;
      } else {
        items[tabSelected].forEach(s => s[selected] = false);
      }

      PREV_INDEX = i;
      items[tabSelected][i][selected] = !items[tabSelected][i][selected];
    }

    isSelectButtonDisabled = false;
    onSelectImages(!selectedImages);
    setSelectedGif(null);
  }, [items, multiselect, selected, selectedImages, tabSelected]);

  const getImages = useCallback((element, i) => {
    let path = element.path || element.url;
    const isVideo = element.fileType && element.fileType.indexOf('video') >= 0;

    return (
		<div className="animation-container"
			key={i}
			onClick={() => markSelected(i)}
		>
			{isVideo ?
				<video width="165" height="100" controls>
					<source src={path} />
				</video>
				:
				<img src={path} className="animation-file" alt={element.name} />
			}
			{element.url &&
				<div onClick={(e) => onRemoveFile(e, element.name, tabSelected)} className="remove-item" title='Видалити'>
					<i className='fas fa-trash-alt'></i>
				</div>
			}
			<div className={`checked-item ${element[selected] && !selectedGif ? 'active' : ''}`}>
				<i className="fa-solid fa-check"></i>
			</div>
		</div>
    )
  }, [markSelected, onRemoveFile, selected, tabSelected, selectedGif])

  const getSounds = useCallback((element, i) => {
    let path = element.path || element.url;

    return (
      <div className={'sound-container ' + (element[selected] ? 'active' : '')}
        key={i}
        onClick={() => markSelected(i)}>
        <div className="icon-name">{element.name}</div>
        <audio controls>
          <source src={path} type="audio/mpeg" />
        </audio>
        {element.url &&
          <div onClick={(e) => onRemoveFile(e, element.name, tabSelected)} className="remove-item">
            <i className='fas fa-trash-alt'></i>
          </div>
        }
      </div>
    )
  }, [markSelected, onRemoveFile, selected, tabSelected])

  const updateSelectButtonDisabled = useCallback((disabled) => {
    isSelectButtonDisabled = disabled;
  }, []);

  const handleClick = useCallback((e, items, selectedGif, tabSelected) => {
    let mediaFiles = {};

    if (selectedGif) {
		const { id, content_description: name, media_formats: { gif: { url } } } = selectedGif;
		mediaFiles = {
			images: [{ name, url, id, selected: true }],
			sounds: []
		};
    } else {
		mediaFiles = items;
    }

    saveSelectedMedia(e, mediaFiles, tabSelected)
  }, [saveSelectedMedia])

  const getItem = useCallback((element, i) => {
    if (tabSelected === 'images') {
      if (showStandardImages) {
        return getImages(element, i);
      }
      return
    }

    return getSounds(element, i);
  }, [getImages, getSounds, showStandardImages, tabSelected])

  return (
    <>
		<div className="menu-container">
			{/* <div className="small">Файл: до {MAX_FILE_SIZE}мб</div>
			<div className="small">Кількість файлів: {alreadyUploaded}/{UPLOAD_LIMIT}</div> */}

			{!multiselect && (
				<>
				<h4 className='text-center mb-3'><strong>Обрати {tabSelected === 'images' ? 'картинку' : 'мелодію'} або завантажити свою</strong></h4>
				<div className='upload-image'>
					{showUpload && alreadyUploaded >= UPLOAD_LIMIT ? (
						<span>Видаліть деякі файли, для того, щоб завантажити нові</span>
					) : (
						<>
						<span>Максимальна вага: 5 Мб.</span>
						{tabSelected === 'images' && <span className='text-center'>Найкраще підходить: 590 x 335 пікселів.</span>}
						<div className='upload-btn-wrapper'>
							<label htmlFor="images" className="upload-button-label mb-0">
								<div className='upload-button-page-view'>Вибрати файл</div>
							</label>
							<input
								id="images"
								type="file"
								className="upload-button-page"
								accept={tabSelected === 'sounds' ? 'audio/*' : 'video/*, image/*'}
								onChange={(e) => uploadHandler(e, tabSelected)}
							/>
						</div>
						</>
					)}
				</div>
				</>
			)}
			{!multiselect && tabSelected === 'images' && (
				<TenorGifSearch
					selectedGif={selectedGif}
					onClick={setSelectedGif}
					updateSelectButtonDisabled={updateSelectButtonDisabled}
					setShowStandardImages={setShowStandardImages}
				/>
			)}
			{multiselect && (
				<div className='media-select'>
					<div className={tabSelected === 'images' ? 'images' : ''} onClick={() => onSelectTab('images')}>Зображення</div>
					<div className={tabSelected === 'sounds' ? 'sounds' : ''} onClick={() => onSelectTab('sounds')}>Звуки</div>
				</div>
			)}
			<div className={`modal-media ${multiselect ? 'multiselect' : ''} ${!multiselect && tabSelected === 'sounds' ? 'sounds' : ''}`}>
				{items[tabSelected].map(getItem)}
			</div>
			{/* <div className='close-icon' onClick={toggleModal}>
				<i className="fa-solid fa-xmark"></i>
			</div> */}
		</div>

		<div className='button-group justify-content-end'>
			{/* <button className='btn btn-outline-dark' onClick={toggleModal}>Скасувати</button> */}
			<button className='btn btn-dark'
				disabled={isSelectButtonDisabled}
				onClick={(e) => handleClick(e, items, selectedGif, tabSelected)}
			>
				Зберегти
			</button>
		</div>
    </>
	)
};

export default MediaModal;
