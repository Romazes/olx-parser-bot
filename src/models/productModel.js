const ALLOWED_QUANTITY = 1000;

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

export function cleanAncientProductsByCategory() {
  for (const userId in productsByUserIdByCategory) {
    const categories = productsByUserIdByCategory[userId];
    for (const category in categories) {
      const productsAmount = productsByUserIdByCategory[userId][category].length;
      if (productsAmount > ALLOWED_QUANTITY) {
        console.log(
          `cleanAncientProductsByCategory(): beforeLength:${productsAmount}`
        );
        productsByUserIdByCategory[userId][category].splice(0, productsAmount.length / 2);
        console.log(
          `cleanAncientProductsByCategory(): AfterLength:${ productsByUserIdByCategory[userId][category].length}`
        );
      }
    }
  }
}
