const app = require('./src/app');

const PORT = parseInt(process.env.PORT, 10) || 10000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 LMS Server running on http://${HOST}:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Process PID: ${process.pid}`);
});
