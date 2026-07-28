import { Button, Carousel, Flex, Typography } from 'antd';

const { Text } = Typography;

const Options = () => (
  <Flex vertical gap={16} style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Button type="primary">
      Contact Information / About Me
    </Button>
    <Button type="primary">
      Projects
    </Button>
    <Button type="primary">
      Resume
    </Button>
  </Flex>
);

const CustomCarousel = () => {
    const onChange = (currentSlide: number) => {
        console.log(currentSlide);
    };

    const slideStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      color: '#ffffff',
    };

    return (
      <Carousel dotPlacement={'end'} style={{ height: '100vh', width: '100%', border: '1px solid blue' }} afterChange={onChange}>
        <div>
          <Flex style={slideStyle}>
            <Options />
          </Flex>
        </div>
        <div>
          <Flex style={slideStyle}>
            <Text style={{ color: '#ffffff' }}>2</Text>
          </Flex>
        </div>
        <div>
          <Flex style={slideStyle}>
            <Text style={{ color: '#ffffff' }}>3</Text>
          </Flex>
        </div>
        <div>
          <Flex style={slideStyle}>
            <Text style={{ color: '#ffffff' }}>4</Text>
          </Flex>
        </div>
      </Carousel>
  );
};

export default CustomCarousel;
