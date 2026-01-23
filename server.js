const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// ВАЖНО: Эти строки должны быть ВЫШЕ всех маршрутов (app.post/get)
app.use(express.json()); 
app.use(express.static('public'));

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI)
    .then(() => console.log('База данных подключена 🚀'))
    .catch(err => console.error('Ошибка БД:', err));

// --- МОДЕЛИ ---

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

const goalSchema = new mongoose.Schema({
    title: String,
    completed: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Привязка к юзеру
});
const Goal = mongoose.model('Goal', goalSchema);

// --- AUTH MIDDLEWARE (Проверка токена) ---

const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (e) {
        res.status(401).json({ error: 'Нужна авторизация' });
    }
};

// --- МАРШРУТЫ АВТОРИЗАЦИИ ---

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.json({ message: 'Пользователь создан' });
    } catch (e) {
        res.status(400).json({ error: 'Ошибка регистрации или Email занят' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: 'Неверный логин или пароль' });
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });
    } catch (e) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// --- МАРШРУТЫ ЗАДАЧ (Добавлен auth) ---

app.get('/api/goals', auth, async (req, res) => {
    const goals = await Goal.find({ userId: req.userId }); // Только свои задачи
    res.json(goals);
});

app.post('/api/goals', auth, async (req, res) => {
    const newGoal = new Goal({ ...req.body, userId: req.userId });
    await newGoal.save();
    res.json(newGoal);
});

app.patch('/api/goals/:id', auth, async (req, res) => {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
    if (!goal) return res.status(404).send();
    goal.completed = !goal.completed;
    await goal.save();
    res.json(goal);
});

app.delete('/api/goals/:id', auth, async (req, res) => {
    await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Удалено' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер летит на порту ${PORT}`));