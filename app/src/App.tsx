import './App.css'
import horse from './assets/horse.jpg'

import { Col, Image, Row } from 'antd';
import CustomCarousel from './components/CutomCarousel';
import ShaderBackground from './components/ShaderBackground';
import './components/components.css';

const App = () => {
  return (
    <>
    <ShaderBackground />
    <Row className="appContent">
      <Col flex="none">
        <Image
          alt="basic"
          src={horse}
          height="100vh"
          width="auto"
          preview={false}
        />
      </Col>
      <Col flex="auto" style={{ width:"10px" }}>
        <CustomCarousel />
      </Col>
    </Row>
    </>
  );
}

export default App;
