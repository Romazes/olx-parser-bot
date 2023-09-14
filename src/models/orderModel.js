const orders = {};

export function getOrdersLength() {
  return Object.keys(orders).length;
}

export function getOrderByOrderId(orderId) {
  return orders[orderId];
}

export function createOrder(order) {
  if(!orders[order.orderId]) {
    orders[order.orderId] = { title: order.orderTitle, link: order.orderLink };
    return true;
  }
  return false;
}
