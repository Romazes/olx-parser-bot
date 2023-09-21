const ALLOWED_QUANTITY_PRODUCTS = 100;

const productsByUserIdByCategory = {};

export function getProductById(userId, category, searchKeyWords, itemId) {
  return productsByUserIdByCategory[userId][category][searchKeyWords].find(
    (o) => o.productId == itemId
  );
}

export function createNewProduct(
  userId,
  category,
  searchKeyWords,
  item,
  cleanOldProduct = false
) {
  const newProduct = {
    productId: item.id,
    title: item.title,
    link: item.link,
  };

  if (!productsByUserIdByCategory[userId]) {
    productsByUserIdByCategory[userId] = {
      [category]: { [searchKeyWords]: [newProduct] },
    };
  } else if (!productsByUserIdByCategory[userId][category]) {
    Object.assign(productsByUserIdByCategory[userId], {
      [category]: { [searchKeyWords]: [newProduct] },
    });
  } else if (!productsByUserIdByCategory[userId][category][searchKeyWords]) {
    Object.assign(productsByUserIdByCategory[userId][category], {
      [searchKeyWords]: [newProduct],
    });
  } else {
    productsByUserIdByCategory[userId][category][searchKeyWords].push(
      newProduct
    );
  }

  if (
    cleanOldProduct &&
    productsByUserIdByCategory[userId][category][searchKeyWords].length >=
      ALLOWED_QUANTITY_PRODUCTS
  ) {
    productsByUserIdByCategory[userId][category][searchKeyWords].shift();
  }

  return newProduct;
}
