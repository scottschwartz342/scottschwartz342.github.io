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
      I am a recent graduate from the University of Pittsburgh with a Bachelor of
      Science in Computer Science. Originally from Long Island, New York, I have
      been passionate about computer science and technology for as long as I can
      remember. My academic journey has been driven by a strong desire to expand
      my skills and knowledge in the field.
    </Paragraph>
    <Paragraph style={flush}>
      Throughout my studies, I have developed a strong foundation in programming
      and algorithms. I am eager to apply my learning in practical settings and
      contribute to innovative work. I seek to continue to grow as a computer
      scientist and utilize my skills within the tech industry/ research.
    </Paragraph>
    <Paragraph style={flush}>
      I am excited about opportunities to collaborate and explore the exciting
      world of technology and computers!
    </Paragraph>
  </Flex>
);

export default Info;
