import { Button, Flex } from 'antd';

import { Option } from './Option';
import './components.css';

type OptionsProps = {
  onNavigate: (target: Option) => void;
};

const Options = ({ onNavigate }: OptionsProps) => (
  <Flex vertical gap={16} style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Button className="navButton" size="large" onClick={() => onNavigate(Option.Info)}>
      Contact Information / About Me
    </Button>
    <Button className="navButton" size="large" onClick={() => onNavigate(Option.Projects)}>
      Projects
    </Button>
    <Button className="navButton" size="large" onClick={() => onNavigate(Option.Resume)}>
      Resume
    </Button>
  </Flex>
);

export default Options;
