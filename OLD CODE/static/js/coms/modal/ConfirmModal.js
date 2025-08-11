import React from 'react';
import ReactModal from 'react-modal';

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
ReactModal.setAppElement('#root')
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
	padding: '32px 40px',
    borderRadius: '30px',
    transform: 'translate(-50%, -50%)',
    height: 'auto',
    width: '400px',
    zIndex: '99',
    overflowX: 'hidden',
  }
};

export const ConfirmModal = ({children, isModalOpen, toggleModal }) => {

  return (
    <ReactModal
      isOpen={isModalOpen}
      onAfterOpen={null}
      onRequestClose={() => toggleModal(false)}
      style={customStyles}
      contentLabel="Confirm Modal"
    >
      {children}
	  <div className='close-confirm-modal' onClick={() => toggleModal(false)}>
	  	<i className="fa-solid fa-xmark"></i>
	  </div>
    </ReactModal>
  )
}
