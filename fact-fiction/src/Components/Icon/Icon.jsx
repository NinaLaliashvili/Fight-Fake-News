import "./Icon.css";

export const Icon = ({ i, onClick }) => {
  return (
    <span 
    className="Icon material-symbols-rounded" 
    data-clickable={onClick && true}
    onClick={onClick}
    >
      {i}
    </span>
  );
};