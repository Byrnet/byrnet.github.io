const express = require('express');
const path = require('path');
const app = express();

// Раздача статических файлов из папки public
app.use(express.static(path.join(__dirname, 'public')));

mysql_host = 'localhost:3306'
mysql_user = 'byrnet'
mysql_password = 'Byrfox2211'
mysql_database = 'Base_Data'

// Обработка всех маршрутов - возврат index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});