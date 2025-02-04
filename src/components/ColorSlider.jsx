import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

export default function ColorSlider({ width = 300 }) {
  const [brightness, setBrightness] = React.useState(100);

  React.useEffect(() => {
    document.body.style.filter = `brightness(${brightness}%)`;
  }, [brightness]);

  const handleChange = (event, newValue) => {
    setBrightness(newValue);
  };

  return (
    <Box sx={{ width: width }}>
      <Slider
        aria-label="Brillo"
        value={brightness}
        onChange={handleChange}
        min={50}
        max={100}
        color="secondary"
      />
    </Box>
  );
}
