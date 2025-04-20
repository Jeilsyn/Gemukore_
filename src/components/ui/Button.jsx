const Button = ({ loading, children, ...props }) => (
    <button {...props} disabled={loading}>
      {loading ? <span className="button-loader">Cargando...</span> : children}
    </button>
  );
  
  export default Button;
  
  