const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./ustukan.db');

// ===== DATABASE INIT =====
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT,
    address TEXT,
    phone TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price INTEGER,
    category TEXT,
    branch_id INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT,
    phone TEXT,
    address TEXT,
    items TEXT,
    total INTEGER,
    branch_id INTEGER,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login TEXT,
    password_hash TEXT
  )`);
});

// ===== API =====

// Филиалы
app.get('/api/branches', (req, res) => {
  db.all(`SELECT * FROM branches`, [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// Меню
app.get('/api/menu/:branchId', (req, res) => {
  db.all(
    `SELECT * FROM menu WHERE branch_id = ?`,
    [req.params.branchId],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// Создать заказ
app.post('/api/order', (req, res) => {
  const { customer_name, phone, address, items, total, branch_id } = req.body;
  db.run(
    `INSERT INTO orders (customer_name, phone, address, items, total, branch_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      customer_name,
      phone,
      address,
      JSON.stringify(items),
      total,
      branch_id
    ],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ success: true, order_id: this.lastID });
    }
  );
});

// Админка: логин
app.post('/api/admin/login', (req,res)=>{
  const {login,password} = req.body;
  db.get('SELECT * FROM admin WHERE login=?',[login], async(err, admin)=>{
    if(!admin) return res.status(401).json({error:'no admin'});
    const ok = await bcrypt.compare(password, admin.password_hash);
    if(!ok) return res.status(401).json({error:'bad pass'});
    res.json({success:true});
  });
});

// Админка: получить все заказы
app.get('/api/admin/orders', (req,res)=>{
  db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows)=>{
    if(err) return res.status(500).json(err);
    res.json(rows);
  });
});

// Обновить статус заказа
app.post('/api/admin/order/status',(req,res)=>{
  const {id,status} = req.body;
  db.run('UPDATE orders SET status=? WHERE id=?',[status,id], function(err){
    if(err) return res.status(500).json(err);
    res.json({success:true});
  });
});

// ===== SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('🔥 Backend запущен на порту', PORT));
