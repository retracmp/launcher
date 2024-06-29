type InputProps = {
  value: string;
  onChange: (v: string) => void;
  title: string;
  title_description?: string;
  description: string;
};

const Input = (props: InputProps) => {
  return (
    <>
      <div className="toggle noclick">
        <div className="toggleInfo">
          <span>{props.title}</span>
          <p>{props.title_description}</p>
        </div>
      </div>
      <input
        className="toggleInput"
        type="text"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.description}
      />
    </>
  );
};

export default Input;
