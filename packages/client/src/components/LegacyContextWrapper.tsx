import React, { ReactNode } from 'react';
import { MarchProvider } from '../context/MarchContext';

interface LegacyContextWrapperProps {
  children: ReactNode;
}

const LegacyContextWrapper: React.FC<LegacyContextWrapperProps> = ({ children }) => {
  return (
    <MarchProvider>
      {children}
    </MarchProvider>
  );
};

export default LegacyContextWrapper; 