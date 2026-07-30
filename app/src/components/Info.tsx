import { Flex, Typography } from 'antd';

import './components.css';

const { Title, Paragraph, Text, Link } = Typography;

const flush: React.CSSProperties = { margin: 0 };

const Info = () => (
  <Flex vertical gap={16} className="panel">
    <Title level={1} style={flush}>Information:</Title>

    <Title level={3} style={flush}>Contact Info:</Title>
    <Paragraph style={flush}>
      Email: scottschwartz342@gmail.com
    </Paragraph>

    <Title level={3} style={flush}>Links:</Title>
    <Paragraph style={flush}>
      <Text style={flush}>LinkedIn: </Text>
      <Link href="https://www.linkedin.com/in/scottschwartz342/" target="_blank">
        https://www.linkedin.com/in/scottschwartz342/
      </Link>
      <br />
      <Text style={flush}>GitHub: </Text>
      <Link href="https://github.com/scottschwartz342" target="_blank">
        https://github.com/scottschwartz342
      </Link>
    </Paragraph>

    <Title level={3} style={flush}>Who am I?</Title>
    <Paragraph style={flush}>
      Hello! My name is Scott Schwartz. I grew up on Long Island, studied computer science at the
      University of Pittsburgh, and I've spent the past year in Philadelphia
      working as a software engineer at WebstaurantStore.
    </Paragraph>
    <Paragraph style={flush}>
      Growing up, I always loved tinkering. Whether it was building legos, playing with the boxes
      my dad would bring home from shopping at BJ's, or taking apart broken electronics, I am the happiest when I can let my mind be curious and creative.
    </Paragraph>
    <Paragraph style={flush}>
      In college my favorite classes were the algorithm based ones. There was someting so satisfying about bridging the gap between a problem's input and output. 
      At work, I love the feeling of knowing that my contributions help people's day-by-day.
    </Paragraph>
    <Paragraph style={flush}>
      I'm always open to new opportunities, so if you think we'd be a good fit,
      please feel free to reach out. My email and links are right above!
    </Paragraph>
  </Flex>
);

export default Info;
