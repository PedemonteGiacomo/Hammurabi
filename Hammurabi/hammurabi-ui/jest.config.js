module.exports = {
    preset: 'react-app',  // This preset handles React and TypeScript
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    moduleNameMapper: {
      // Ensure you have correct path mappings if needed
      '^react-router-dom$': 'hammurabi-ui/node_modules/react-router-dom',
    },
  };
  