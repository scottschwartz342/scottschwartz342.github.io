import './App.css'
import horse from './assets/horse.jpg'

import { Col, ConfigProvider, Flex, Image, Row, Space, theme, Typography } from 'antd';
import CustomCarousel from './components/CutomCarousel';

const { Title } = Typography;

const Name = () => (
  <Flex vertical gap={16}>
    <Title level={1}>Scott</Title>
    <Title level={1}>Schwartz</Title>
  </Flex>
);

const App = () => {
  return (
    <Row style={{ height: '100vh', width: '100vw' }}>
      <Col style={{ border: '1px solid red'}}>
        <Image
          alt="basic"
          src={horse}
          height="100vh"
          width="auto"
          preview={false}
        />
      </Col>
      <Col style={{ border: '1px solid red'}}>
        <Name />
      </Col>
      <Col flex="auto" style={{ border: '1px solid red' }}>
        <CustomCarousel />
      </Col>
    </Row>
  );
}

export default App;
