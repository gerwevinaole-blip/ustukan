const API = "https://YOUR-BACKEND.onrender.com"; // <- заменяешь на Render URL
let cart = [];

function loadMenu(){
  const branch = document.getElementById('branch').value;
  fetch(`${API}/api/menu/${branch}`)
    .then(r=>r.json())
    .then(data=>{
      const div = document.getElementById('menu');
      div.innerHTML='';
      data.forEach(i=>{
        div.innerHTML += `<div class='card'>${i.name} — ${i.price} сом <button onclick='add("${i.name}",${i.price})'>+</button></div>`
      })
    });
}

function add(name,price){
  cart.push({name,price});
  renderCart();
}

function renderCart(){
  const c = document.getElementById('cart');
  c.innerHTML='';
  let total=0;
  cart.forEach(i=>{total+=i.price;c.innerHTML+=`<div>${i.name}</div>`});
  c.innerHTML+=`<b>Итого: ${total}</b>`;
}

function order(){
  fetch(`${API}/api/order`,{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      customer_name:'Клиент',
      phone:'',
      address:'',
      items:cart,
      total:cart.reduce((s,i)=>s+i.price,0),
      branch_id:document.getElementById('branch').value
    })
  }).then(()=>alert('Заказ отправлен'))
}

loadMenu();
