import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const API = "https://YOUR-BACKEND.onrender.com";

  useEffect(() => {
    fetch(`${API}/api/admin/orders`)
      .then((r) => r.json())
      .then(setOrders);
  }, []);

  const updateStatus = (id, status) => {
    fetch(`${API}/api/admin/order/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).then(() => {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
    });
  };

  return (
    <div className="p-6 grid gap-6">
      <h1 className="text-2xl font-bold">USTUKAN — Админка PRO</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="rounded-2xl shadow">
            <CardContent className="p-4 space-y-2">
              <div className="font-semibold">Заказ #{order.id}</div>
              <div>Клиент: {order.customer_name}</div>
              <div>Тел: {order.phone}</div>
              <div>Сумма: {order.total} сом</div>
              <div className="text-sm">Статус: {order.status}</div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => updateStatus(order.id, "cooking")}>Готовится</Button>
                <Button onClick={() => updateStatus(order.id, "delivering")}>Доставка</Button>
                <Button onClick={() => updateStatus(order.id, "done")}>Завершён</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
