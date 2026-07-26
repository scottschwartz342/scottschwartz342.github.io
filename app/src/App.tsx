import './App.css'
import horse from './assets/horse.jpg'

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const Name = () => (
  <Stack direction="column" spacing={2}>
    <Typography variant="h1">Scott</Typography>
    <Typography variant="h1">Schwartz</Typography>
  </Stack>
);

const Options = () => (
  <Stack direction="column" style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }} spacing={2}>
    <Button variant="contained">
      Contact Information / About Me
    </Button>
    <Button variant="contained">
      Projects
    </Button>
    <Button variant="contained">
      Resume
    </Button>
  </Stack>
);

const App = () => {
  return ( 
    <>
      <Stack direction="row" style={{ height: '100vh', alignItems: 'center' }} spacing={2} >
        <img className="horse-image" style={{ height: '100%' }} src={horse} alt="Horse" />
        <Name /> 
        <Options />
      </Stack>  
    </>
  );
}

export default App;
