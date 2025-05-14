const { getDatabase } = require('../database');
const Product = require("./Product"); 
const mongodb = require('mongodb');

const COLLECTION_NAME = "carts"; 



class Cart {
 
  static async add(productName) {
    const db = getDatabase();
    const product = await Product.findByName(productName);

    if (!product || !product._id) {
      console.error(`Product '${productName}' not found or has no ID.`);
      throw new Error(`Product '${productName}' not found or has no ID.`);
    }

    const existingCartItem = await db.collection(COLLECTION_NAME).findOne({ productId: product._id });

    if (existingCartItem) {
      return db.collection(COLLECTION_NAME).updateOne(
        { productId: product._id },
        { $inc: { quantity: 1 } }
      );
    } else {
      return db.collection(COLLECTION_NAME).insertOne({
        productId: product._id,
        productName: product.name, 
        price: product.price,      
        quantity: 1
      });
    }
  }

  static async getItems() {
    const db = getDatabase();
    const cartItems = await db.collection(COLLECTION_NAME).find().toArray();

    const populatedItems = await Promise.all(cartItems.map(async item => {
        const productDetails = await Product.findById(item.productId);
        if (productDetails) {
            return {
                product: productDetails, 
                quantity: item.quantity
            };
        }
        return null; 
    }));

    return populatedItems.filter(item => item !== null);
  }


  static async getProductsQuantity() {
    const db = getDatabase();
    const cartItems = await db.collection(COLLECTION_NAME).find().toArray();
    if (!cartItems || cartItems.length === 0) {
      return 0;
    }
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  static async getTotalPrice() {
    const db = getDatabase();
    const cartItems = await db.collection(COLLECTION_NAME).find().toArray();
    if (!cartItems || cartItems.length === 0) {
        return 0;
    }

    
    let totalPrice = 0;
    for (const item of cartItems) {
       
        totalPrice += item.price * item.quantity;
    }
    return totalPrice;
  }

  static async clearCart() {
    const db = getDatabase();
    return db.collection(COLLECTION_NAME).deleteMany({});
  }
}

module.exports = Cart;