const ALLOWED_QUANTITY = 1000;

const productsByCategory = {};

export function getProductById(category, itemId) {
  return productsByCategory[category].find((o) => o.productId == itemId);
}

export function createNewProduct(category, item) {
  const newProduct = {
    productId: item.id,
    title: item.title,
    link: item.link,
  };

  if (!productsByCategory[category]) {
    productsByCategory[category] = [newProduct];
  } else {
    productsByCategory[category].push(newProduct);
  }

  return newProduct;
}

export function cleanAncientProductsByCategory() {
  for(let category in productsByCategory) {
    const products = productsByCategory[category];
    if(products.length > ALLOWED_QUANTITY) {
      console.log(`cleanAncientProductsByCategory(): beforeLength:${products.length}`)
      products.splice(0, products.length / 2);
      console.log(`cleanAncientProductsByCategory(): AfterLength:${products.length}`)
    }
  }
}