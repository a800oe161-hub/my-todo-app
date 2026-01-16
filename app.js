const http = require('http'); // Подключаем модуль для работы с сетью
let views = 0;


const server = http.createServer((req, res) => {
    // Этот код срабатывает каждый раз, когда кто-то заходит на сайт
    views++
    console.log("Кто-то зашел на сервер!"); 
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<h1>Количество посещений: ${views}</h1>`);
    
});

// Заставляем сервер "слушать" порт 3000
server.listen(3000, '127.0.0.1', () => {
    console.log('Сервер запущен! Открой в браузере адрес: http://localhost:3000');
});