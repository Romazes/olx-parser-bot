const orders = {};

export function getOrdersLength() {
  return Object.keys(orders).length;
}

export function getOrderByOrderId(orderId) {
  return orders[orderId];
}

export function createOrder(order) {
    orders[order.orderId] = { title: order.orderTitle, link: order.orderLink };
    return orders[order.orderId];
}
