const productsByUserIdByCategory = {};

export function getProductById(userId, category, itemId) {
  return productsByUserIdByCategory[userId][category].find(
    (o) => o.productId == itemId
  );
}

export function createNewProduct(userId, category, item) {
  const newProduct = {
    productId: item.id,
    title: item.title,
    link: item.link,
  };

  if (!productsByUserIdByCategory[userId]) {
    productsByUserIdByCategory[userId] = { [category]: [newProduct] };
  } else if (!productsByUserIdByCategory[userId][category]) {
    Object.assign(productsByUserIdByCategory[userId], {
      [category]: [newProduct],
    });
  } else {
    productsByUserIdByCategory[userId][category].push(newProduct);
  }

  return newProduct;
}