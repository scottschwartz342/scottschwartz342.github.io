import './App.css'
import horse from './assets/horse.jpg'

import { Col, Flex, Image, Row, Typography } from 'antd';
import CustomCarousel from './components/CutomCarousel';

const { Title } = Typography;

const Name = () => (
  <Flex vertical gap={16}>
    <Title level={1} style={{ color: '#ffffff' }}>
      Scott
    </Title>
    <Title level={1} style={{ color: '#ffffff' }}>
      Schwartz
    </Title>
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
      <Col flex="none" style={{ border: '1px solid red'}} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '16px', marginRight: '16px' }}>
        <Name />
      </Col>
      <Col flex="auto" style={{ border: '1px solid red' }}>
        <CustomCarousel />
      </Col>
    </Row>
  );
}

export default App;
