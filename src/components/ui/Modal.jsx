// src/components/ui/Modal.jsx
import React from "react";
/* import "./Modal.css"; // Estilos separados, abajo te los dejo
 */
const Modal = ({ onClose, children }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
