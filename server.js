const express = require('express');
const mongoose = require('mongoose');
const app = express();

// 1. Настройки порта и базы данных
const PORT = process.env.PORT || 3000;
// Добавлена настройка для корректной работы с облаком
const dbURI = 'mongodb+srv://a800oe161_db_user:qpQFfPpisSHphpES@cluster0.8gj1bvz.mongodb.net/todoDB?retryWrites=true&w=majority';

// 2. Middleware
app.use(express.static('public'));
app.use(express.json());

// 3. Модель данных
const goalSchema = new mongoose.Schema({
    title: String,
    completed: { type: Boolean, default: false }
});
const Goal = mongoose.model('Goal', goalSchema);

// 4. Маршруты API
// Получение всех задач
app.get('/api/goals', async (req, res) => {
    try {
        const goalsFromDB = await Goal.find();
        res.json(goalsFromDB);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении данных: ' + err.message });
    }
});

// Создание задачи
app.post('/api/goals', async (req, res) => {
    try {
        const newGoal = new Goal(req.body);
        await newGoal.save();
        res.status(201).json(newGoal);
    } catch (err) {
        res.status(400).json({ error: 'Ошибка при сохранении: ' + err.message });
    }
});

// Удаление задачи
app.delete('/api/goals/:id', async (req, res) => {
    try {
        await Goal.findByIdAndDelete(req.params.id);
        res.json({ message: 'Задача успешно удалена' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при удалении: ' + err.message });
    }
});
// Маршрут для переключения статуса задачи (выполнено/не выполнено)
app.patch('/api/goals/:id', async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ error: 'Задача не найдена' });

        // Меняем значение на противоположное
        goal.completed = !goal.completed;
        await goal.save();

        res.json(goal);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка обновления: ' + err.message });
    }
});

// 5. Запуск: Сначала подключаем базу, потом открываем порт
async function start() {
    try {
        await mongoose.connect(dbURI);
        console.log('Ура! База данных подключена 🚀');
        
        app.listen(PORT, () => {
            console.log(`Сервер запущен и слушает порт ${PORT}`);
        });
    } catch (err) {
        console.error('КРИТИЧЕСКАЯ ОШИБКА ЗАПУСКА:', err.message);
        process.exit(1); // Остановить процесс, если база не подключилась
    }
}

start();