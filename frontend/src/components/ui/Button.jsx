export default function Button({ children, variant = 'primary', className = '', icon, ...props }) {
  return (
    <button className={`btn btn-${variant} ${className} ${icon ? 'btn-with-icon' : ''}`.trim()} {...props}>
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
}
