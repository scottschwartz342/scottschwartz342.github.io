import './App.css'
import horse from './assets/horse.jpg'

import { Col, Flex, Image, Row, Typography } from 'antd';
import CustomCarousel from './components/CutomCarousel';

const { Text } = Typography;

const Name = () => (
  <Flex vertical gap={16}>
    <Text style={{ color: '#ffffff', fontSize: '4em', fontFamily: "'Times New Roman', serif" }}>
      Scott
    </Text>
    <Text style={{ color: '#ffffff', fontSize: '4em', fontFamily: "'Times New Roman', serif" }}>
      Schwartz
    </Text>
  </Flex>
);

const App = () => {
  return (
    <Row>
      <Col flex="none">
        <Image
          alt="basic"
          src={horse}
          height="100vh"
          width="auto"
          preview={false}
        />
      </Col>
      {/* <Col flex="none" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '16px', marginRight: '16px' }}>
        <Name />
      </Col> */}
      <Col flex="auto" style={{ width:"10px" }}>
        <CustomCarousel />
      </Col>
    </Row>
  );
}

export default App;
