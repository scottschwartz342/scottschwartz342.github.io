import { Button, Flex } from 'antd';

import { Option } from './Option';
import './retro.css';

type OptionsProps = {
  onNavigate: (target: Option) => void;
};

const Options = ({ onNavigate }: OptionsProps) => (
  <Flex vertical gap={16} style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Button className="retroNavButton" onClick={() => onNavigate(Option.Info)}>
      Contact Information / About Me
    </Button>
    <Button className="retroNavButton" onClick={() => onNavigate(Option.Projects)}>
      Projects
    </Button>
    <Button className="retroNavButton" onClick={() => onNavigate(Option.Resume)}>
      Resume
    </Button>
  </Flex>
);

export default Options;
