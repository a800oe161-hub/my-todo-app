const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Используем переменную окружения для безопасности
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI)
    .then(() => console.log('Ура! База данных подключена 🚀'))
    .catch(err => console.error('Ошибка БД:', err));

const goalSchema = new mongoose.Schema({
    title: String,
    completed: Boolean
});

const Goal = mongoose.model('Goal', goalSchema);

app.get('/api/goals', async (req, res) => {
    const goals = await Goal.find();
    res.json(goals);
});

app.post('/api/goals', async (req, res) => {
    const newGoal = new Goal(req.body);
    await newGoal.save();
    res.json(newGoal);
});

app.patch('/api/goals/:id', async (req, res) => {
    const goal = await Goal.findById(req.params.id);
    goal.completed = !goal.completed;
    await goal.save();
    res.json(goal);
});

app.delete('/api/goals/:id', async (req, res) => {
    await Goal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Удалено' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер летит на порту ${PORT}`));