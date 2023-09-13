const orders = [];

export function getOrdersLength() {
  return orders.length;
}

export function getAllOrders() {
  return orders;
}

export function getOrderByOrderId(orderId) {
  return orders.find((o) => o.orderId == orderId);
}

export function createOrder(order) {
  const newOrder = { id: orders.length + 1, ...order };
  orders.push(newOrder);
  return newOrder;
}