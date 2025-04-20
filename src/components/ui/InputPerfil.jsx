// components/ui/Input.jsx
const Input = ({ label, name, type, value, onChange, placeholder, required }) => {
    return (
      <div className="input-group">
        {label && <label htmlFor={name}>{label}</label>}
        {type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="form-input"
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="form-input"
          />
        )}
      </div>
    );
  };

  export default Input;