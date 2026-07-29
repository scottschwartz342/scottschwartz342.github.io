import { Collapse, Flex, Typography } from 'antd';

import './retro.css';

const { Title, Paragraph, Link } = Typography;

const flush: React.CSSProperties = { margin: 0 };

const algorithms = [
  {
    key: 'airline-graph',
    label: 'Airline Graph',
    children: (
      <p>Implemented BFS and DFS on a graph representing Airports.</p>
    ),
  },
  {
    key: 'lzw-compression',
    label: 'LZW Compression',
    children: (
      <p>
        I implemented the LZW compression algorithm. I used an adaptive codeword
        width to allow the codebook size to increase. I also allowed the the
        user to reset the codebook after its maximum size is reached to allow
        LZW to learn new patterns.
      </p>
    ),
  },
  {
    key: 'auto-complete',
    label: 'Auto Complete',
    children: (
      <p>
        I implemented a simple automatic word-completion system using a DLB
        Trie.
      </p>
    ),
  },
  {
    key: 'boggle-solver',
    label: 'Boggle Solver',
    children: (
      <p>
        I completed an implementation of a Boggle game program that generates
        and answers a variety of queries on a Boggle board. The Boggle Game in
        this assignment is defined as follows. Given a two-dimensional board of
        letters, find all words with at least three adjacent letters. Adjacent
        letters are horizontal, vertical, or diagonal neighbors. Any tile in the
        board can only be used once per word, but can be used for multiple
        words.
      </p>
    ),
  },
];

const operatingSystems = [
  {
    key: 'filesystem-simulator',
    label: 'Filesystem Simulator',
    children: (
      <>
        <p>
          FUSE is a Linux kernel extension that allows for a userspace program
          to provide the implementations for the various file-related syscalls.
          I used FUSE to create a custom filesystem, managed via a single file,
          .disk, that represented a disk device. The filesystem was a two-level
          directory system.
        </p>
        <p>
          Skills used: C, Reading/ Writing to Files, Memory Management,
          Indexing, Strings
        </p>
      </>
    ),
  },
  {
    key: 'virtual-memory-simulator',
    label: 'Virtual Memory Simulator',
    children: (
      <>
        <p>
          I simulated the Least recently Used and Optimal replacement algorithms
          by reading tarces of memory references that were geenrated by two
          rpocesses while running on a 32-bit system.
        </p>
        <p>
          Skills used: Java, Object Oriented Programming, Command-Line Argument
          Handling, File Handling/ Parsing, Algorithm Implementation, HashMaps,
          Linked Lists, Priority Queues
        </p>
      </>
    ),
  },
  {
    key: 'synchronization-museum',
    label: 'Synchronization Museum',
    children: (
      <>
        <p>
          To simulate a working museum, visitors and guides are modeled as
          threads that need to be synchronized in a way to meet the requirements
          of the project.
        </p>
        <p>Skills used: C, Mutexes, Condition Variables, Readers-Writers Locks</p>
      </>
    ),
  },
  {
    key: 'syscalls',
    label: 'Syscalls',
    children: (
      <>
        <p>
          I created a semaphore data type and implemented sempahore down() and
          up(). I added four new System Calls to create and operate on
          semaphores. cs1550_create, cs1550_down, cs1550_up, cs1550_close
        </p>
        <p>Skills used: C, Queues, Spinlocks</p>
      </>
    ),
  },
];

const Projects = () => (
  <Flex vertical gap={16} className="retroFrame" style={{ maxWidth: '48em', overflowY: 'auto', maxHeight: '80vh' }}>
    <Title level={1} style={flush}>Projects:</Title>
    <Paragraph style={flush}>
      Updated as of: 5/11/2025
      <br />
      Does not include all school courses/projects
    </Paragraph>

    <Title level={3} style={flush}>Dummy Wordle</Title>
    <Flex vertical>
      <Link href="https://scottschwartz342.github.io/dummy-wordle/" target="_blank">
        Click here to go to Dummy Wordle
      </Link>
      <Link href="https://github.com/scottschwartz342/dummy-wordle" target="_blank">
        Click here for the Dummy Wordle GitHub page
      </Link>
    </Flex>

    <Title level={3} style={flush}>The Typing Monkey</Title>
    <Flex vertical>
      <Link href="https://scottschwartz342.github.io/typing-monkey/" target="_blank">
        Click here to go to the Typing Monkey
      </Link>
      <Link href="https://github.com/scottschwartz342/typing-monkey" target="_blank">
        Click here for the Typing Monkey GitHub page
      </Link>
    </Flex>

    <Title level={3} style={flush}>
      Pitt CS1501: Algorithms and Data Structures
    </Title>
    <Collapse items={algorithms} />

    <Title level={3} style={flush}>Pitt CS1550: Intro to Operating System</Title>
    <Collapse items={operatingSystems} />
  </Flex>
);

export default Projects;
