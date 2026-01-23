const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'; // Добавь это в переменные Render позже

// Модель пользователя
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.json({ message: 'Пользователь создан' });
    } catch (e) {
        res.status(400).json({ error: 'Email уже занят' });
    }
});



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