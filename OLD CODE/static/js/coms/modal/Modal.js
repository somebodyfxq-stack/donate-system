import React from 'react';
import ReactModal from 'react-modal';

import {useFileInteraction} from '../../utils/useFileInteraction';
import MediaModal from './MediaModal';

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
ReactModal.setAppElement('#root')
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    borderRadius: '30px',
    transform: 'translate(-50%, -50%)',
    height: '90%',
    width: '100%',
	padding: '30px',
    maxWidth: '790px',
    zIndex: '99',
    overflow: 'hidden',
  }
};

export const Modal = ({
  isOpen,
  toggleModal,
  titleModal,
  selectedItems = {},
  saveSelectedMedia,
  multiselect,
  selected,
  showDeleteItems,
  showUpload = true,
  rowOpened,
  userFileType = 'all',
}) => {
  const {uploadHandler, removeFile, files, alreadyUploaded} = useFileInteraction(userFileType);
  return (
    <ReactModal
      isOpen={isOpen}
      onAfterOpen={null}
      onRequestClose={toggleModal}
      style={customStyles}
      contentLabel={titleModal || "Example Modal"}
    >
      <MediaModal
        items={{ ...files }}
        saveSelectedMedia={saveSelectedMedia}
        multiselect={multiselect}
        selected={selected}
        selectedItems={selectedItems}
        showDeleteItems={showDeleteItems}
        uploadHandler={(e, item) => uploadHandler(e, item, userFileType)}
        removeFile={removeFile}
        showUpload={showUpload}
        rowOpened={rowOpened}
        alreadyUploaded={alreadyUploaded}
      />
    </ReactModal>
  )
}
