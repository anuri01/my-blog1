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
  padding: '0',
  maxWidth: '90vw',
  maxHeight: '90vh',
  overflow: 'visible', // 버튼이 밖으로 나갈 수 있도록 추가
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
      {/* 👇 --- X 닫기 버튼 추가 --- 👇 */}
      <button onClick={onRequestClose} className="close-modal-button">
        &times;
      </button>
      <img src={imageUrl} alt={imageName} style={{ maxWidth: '100%', maxHeight: '100%', display: 'block'}} />
    </Modal>
  );
}

export default ImageModal;