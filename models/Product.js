const { getDatabase } = require('../database');
const mongodb = require('mongodb');

const COLLECTION_NAME = "products";

class Product {
  constructor(name, description, price, id) {
    this.name = name;
    this.description = description;
    this.price = parseFloat(price) || 0;
    this._id = id ? new mongodb.ObjectId(id) : null;
  }

  async save() {
    const db = getDatabase();
    let dbOp;
    if (this._id) {
      dbOp = db.collection(COLLECTION_NAME).updateOne({ _id: this._id }, { $set: this });
    } else {
      const existingProduct = await Product.findByName(this.name);
      if (existingProduct) {
          console.warn(`Product with name ${this.name} already exists. Not adding duplicate.`);
          return; 
      }
      dbOp = db.collection(COLLECTION_NAME).insertOne(this);
    }
    return dbOp
      .then(result => {
      })
      .catch(err => {
        console.log(err);
      });
  }

  static async getAll() {
    const db = getDatabase();
    return db.collection(COLLECTION_NAME)
      .find()
      .toArray()
      .then(products => {
        return products.map(p => new Product(p.name, p.description, p.price, p._id));
      })
      .catch(err => {
        console.log(err);
      });
  }

  static async add(productData) {
    const price = parseFloat(productData.price);
    if (isNaN(price)) {
        console.error("Invalid price for product:", productData.name);
        return;
    }
    const product = new Product(productData.name, productData.description, price);
    return product.save();
  }


  static async findByName(name) {
    const db = getDatabase();
    return db.collection(COLLECTION_NAME)
      .findOne({ name: name })
      .then(productDoc => {
        if (productDoc) {
          return new Product(productDoc.name, productDoc.description, productDoc.price, productDoc._id);
        }
        return null;
      })
      .catch(err => {
        console.log(err);
      });
  }

  static async findById(prodId) {
    const db = getDatabase();
    return db.collection(COLLECTION_NAME)
        .findOne({ _id: new mongodb.ObjectId(prodId) })
        .then(productDoc => {
            if (productDoc) {
                return new Product(productDoc.name, productDoc.description, productDoc.price, productDoc._id);
            }
            return null;
        })
        .catch(err => {
            console.log(err);
        });
    }


  static async deleteByName(name) {
    const db = getDatabase();
    return db.collection(COLLECTION_NAME)
      .deleteOne({ name: name })
      .then(result => {
         console.log('Deleted');
      })
      .catch(err => {
        console.log(err);
      });
  }

  static async getLast() {
    const db = getDatabase();
    return db.collection(COLLECTION_NAME)
      .find()
      .sort({ _id: -1 })
      .limit(1)
      .next()
      .then(productDoc => {
        if (productDoc) {
          return new Product(productDoc.name, productDoc.description, productDoc.price, productDoc._id);
        }
        return null;
      })
      .catch(err => {
        console.log(err);
      });
  }
}

module.exports = Product;