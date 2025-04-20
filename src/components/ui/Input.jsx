const Input = ({ label, id, type = "text", value, onChange, disabled, error }) => (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-describedby={error ? `${id}-error` : undefined}
        placeholder={`Tu ${label.toLowerCase()}`}
      />
      {error && (
        <div className="error-message" id={`${id}-error`} role="alert">
          {error}
        </div>
      )}
    </div>
  );
  
  export default Input;
  