import React from 'react';
import { Flex, Box, Text } from '@chakra-ui/react';

interface InfoRowProps {
  metadata: Record<string, any>;
}

export const InfoRow: React.FC<InfoRowProps> = ({ metadata }) => {
  const { patientId, studyDescription, seriesDescription } = metadata || {};
  return (
    <Flex bg="gray.800" p={3} gap={8}>
      {['Patient ID', 'Study', 'Series'].map((label, idx) => {
        const val = idx === 0 ? patientId : idx === 1 ? studyDescription : seriesDescription;
        return (
          <Box key={label}>
            <Text fontSize="sm" color="gray.400">{label}</Text>
            <Text fontSize="md" color="white">{val || '—'}</Text>
          </Box>
        );
      })}
    </Flex>
  );
};