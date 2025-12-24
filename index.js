const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./ustukan.db');

// ===== INIT DATABASE =====
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
});

// ===== API =====

// филиалы
app.get('/api/branches', (req, res) => {
  db.all(`SELECT * FROM branches`, [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// меню
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

// создать заказ
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

// ===== SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🔥 USTUKAN backend запущен на порту', PORT);
});

