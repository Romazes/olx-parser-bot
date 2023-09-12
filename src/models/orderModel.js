const orders = [];

export function getAllOrders() {
  return orders;
}

export function getOrderById(id) {
  return orders.find((o) => o.id == id);
}

export function createOrder(order) {
  const newOrder = { id: orders.length + 1, ...order };
  orders.push(newOrder);
  return newOrder;
}