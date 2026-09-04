const fs = require('fs');
const parser = require('./frontend/node_modules/@babel/parser');

const code = fs.readFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

try {
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx']
  });
  console.log('SUCCESS: No Babel syntax or JSX errors found!');
} catch (err) {
  console.error('BABEL PARSE ERROR:', err.message);
  console.error('At loc:', err.loc);
}
