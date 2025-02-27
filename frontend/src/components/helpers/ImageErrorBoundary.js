import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ImageNotSupported } from '@mui/icons-material';

const ImageErrorBoundary = ({ src, alt, style, imageStyle, className }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    console.error(`Image failed to load: ${src}`);
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Base styles for container
  const containerStyles = {
    position: 'relative',
    width: '100%',
    height: '100%',
    ...style
  };

  // Base styles for image
  const baseImageStyles = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    ...imageStyle
  };

  return (
    <Box sx={containerStyles} className={className}>
      {isLoading && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          zIndex: 1
        }}>
          <Typography variant="body2" color="text.secondary">Loading...</Typography>
        </Box>
      )}

      {hasError ? (
        <Box sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          color: '#666',
          padding: 2
        }}>
          <ImageNotSupported sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="body2" align="center">
            Image could not be loaded
          </Typography>
        </Box>
      ) : (
        <img 
          src={src} 
          alt={alt}
          style={baseImageStyles} 
          onError={handleError}
          onLoad={handleLoad}
        />
      )}
    </Box>
  );
};

export default ImageErrorBoundary;
