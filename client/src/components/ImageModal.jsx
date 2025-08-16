import React from 'react';
import Modal from 'react-modal';

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
  },

content: {
  top: '50%',
  left: '50%',
  right: 'auto',
  bottom: 'auto',
  marginRight: '-50%',
  transform: 'translate(-50%, -50%)',
  borer: 'none',
  background: 'transparent',
  maxWidth: '90vw',
  maxHeight: '90vh'
},
};

Modal.setAppElement('#root'); // 웹 접근성을 위해 앱의 루트 요소를 알려줍니다.

function ImageModal({ isOpen, onRequestClose, imageUrl, imageName }) {
  return (
    <Modal
     isOpen={isOpen}
     onRequestClose={onRequestClose}
     style={customStyles}
     contentLabel='Image Modal'
    >
      <img src={imageUrl} alt={imageName} style={{ maxWidth: '100%', maxHeight: '100%', display: 'block'}} />
    </Modal>
  );
}

export default ImageModal;