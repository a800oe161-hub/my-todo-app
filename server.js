const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;
const dbURI = 'mongodb+srv://a800oe161_db_user:qpQFfPpisSHphpES@cluster0.8gj1bvz.mongodb.net/?appName=Cluster0';

mongoose.connect(dbURI)
    .then(() => console.log('Ура! База данных подключена 🚀'))
    .catch((err) => console.log('Ошибка подключения:', err));

app.use(express.static('public')); // Это заставит Express показывать файлы из папки public

// Массив данных (имитация базы данных)
const goals = [
    { id: 1, title: "Выучить основы JS", completed: true },
    { id: 2, title: "Запустить сервер на Express", completed: true },
    { id: 3, title: "Подключить базу данных", completed: false }
];
// 1. Описываем схему (какие поля будут у задачи)
const goalSchema = new mongoose.Schema({
    title: String,
    completed: Boolean
});

// 2. Создаем модель (инструмент для работы с базой)
// Именно это слово "Goal" ты используешь в маршрутах
const Goal = mongoose.model('Goal', goalSchema);
// Разрешаем серверу понимать JSON в запросах
app.use(express.json());

app.post('/api/goals', async (req, res) => {
    const newGoal = new Goal(req.body);
    await newGoal.save();
    res.json(newGoal);
});

// Маршрут, который отдает список из базы (GET)
app.get('/api/goals', async (req, res) => {
    const goalsFromDB = await Goal.find(); // Запрашиваем всё из MongoDB
    res.json(goalsFromDB); 
});

// Маршрут для удаления задачи по её ID
app.delete('/api/goals/:id', async (req, res) => {
    try {
        await Goal.findByIdAndDelete(req.params.id);
        res.json({ message: 'Задача удалена' });
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(port, () => {
    console.log(`Сервер API запущен: http://localhost:${port}/api/goals`);
});