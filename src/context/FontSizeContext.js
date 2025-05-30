import React, { createContext, useContext, useState, useEffect } from 'react';

const FontSizeContext = createContext();
// Proveedor del contexto que maneja el tamaño de fuente
export function FontSizeProvider({ children }) {
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('fontSize');
    return saved ? parseInt(saved, 10) : 12;
  });
  // Cada vez que cambia fontSize, actualizar localStorage para persistencia
  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  // Proveer el contexto con fontSize y función para actualizarlo
  // Además, aplicar el tamaño de fuente directamente a un div que envuelve los children
  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      <div style={{ fontSize: `${fontSize}px` }}>
        {children}
      </div>
    </FontSizeContext.Provider>
  );
}
// Hook personalizado para consumir el contexto del tamaño de fuente
export function useFontSize() {
  return useContext(FontSizeContext);
}
