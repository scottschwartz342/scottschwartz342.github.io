import { Flex, Typography } from 'antd';

/* Imported rather than written as a path string so Vite emits the PDF into the
   build and rewrites this to the hashed URL. A bare './assets/...' would have
   resolved against whatever page URL the app happens to be served from and
   404'd, since nothing copies src/assets to the output verbatim. */
import resumeUrl from '../assets/ScottSchwartzResume.pdf?url';
import './components.css';

const { Title, Paragraph, Link } = Typography;

const flush: React.CSSProperties = { margin: 0 };

const Resume = () => (
  <Flex vertical gap={16} className="panel">
    <Title level={1} style={flush}>Resume:</Title>
    <Paragraph style={flush}>Updated as of: 06/04/2025</Paragraph>
    <Link href={resumeUrl} download="ScottSchwartzResume.pdf">
      Click this to download resume
    </Link>
    {/* Width follows the panel rather than a fixed 800px, which was wider than
        the panel's content box and pushed a horizontal scrollbar onto it. */}
    <embed src={resumeUrl} width="100%" height="2100px" />
  </Flex>
);

export default Resume;
