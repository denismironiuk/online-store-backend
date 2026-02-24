const mongoose = require('mongoose');
const app = require('./app');

// Подключаем Redis только при реальном запуске
require('./utils/redis'); 

const PORT = process.env.PORT || 8081;

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWD}@cluster0.wkaijzr.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch(err => console.log('MongoDB Connection Error:', err));