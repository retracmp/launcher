import { motion } from "framer-motion";

type ToggleProps = {
  onToggle: (set: boolean) => void;
  active: boolean;
  title: string;
  description: string;
};

const Toggle = (props: ToggleProps) => {
  return (
    <button onClick={() => props.onToggle(!props.active)} className="toggle">
      <div className="toggleInfo">
        <span>{props.title}</span>
        <p>{props.description}</p>
      </div>
      <div className="toggleSwitch">
        <motion.div
          initial={{ x: 0 }}
          animate={props.active ? { x: 19.2 } : { x: 0 }}
          className={props.active ? "blob active" : "blob"}
        ></motion.div>
      </div>
    </button>
  );
};

export default Toggle;
