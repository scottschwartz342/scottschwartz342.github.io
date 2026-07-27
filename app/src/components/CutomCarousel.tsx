import { Button, Carousel, Flex } from 'antd';


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
  
    return (
      <>
        1
      </>
  );
};

export default CustomCarousel;
