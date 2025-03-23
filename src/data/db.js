import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  {name: 'users.db', location: 'default'},
  () => console.log('Database connected'),
  error => console.log('Database error: ', error),
);

// Create users table
export const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        username TEXT UNIQUE, 
        password TEXT
      )`,
      [],
      () => console.log('Table created or already exists'),
      error => console.log('Table error: ', error),
    );

    // Cart table with foreign key
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id TEXT NOT NULL,
        name TEXT NOT NULL,
        price TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        farm TEXT NOT NULL,
        image TEXT NOT NULL,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )`,
      [],
      () => console.log('Cart table created'),
      error => console.log('Cart table error', error),
    );
  });
};

initDB();

// Register user
export const registerUser = (username, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userExists = await checkUserExists(username);
      if (userExists) {
        return reject('User already exists');
      }

      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO users (username, password) VALUES (?, ?)',
          [username, password],
          (_, result) => resolve({id: result.insertId, username}),
          error => reject(error),
        );
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Check if username exists
export const checkUserExists = username => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (_, {rows}) => {
          if (rows.length > 0) {
            resolve(true); // User exists
          } else {
            resolve(false); // User does not exist
          }
        },
        error => reject(error),
      );
    });
  });
};

// Check user login
export const loginUser = (username, password) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password],
        (_, {rows}) => {
          if (rows.length > 0) {
            resolve(rows.item(0));
          } else {
            reject('Invalid credentials');
          }
        },
        error => reject(error),
      );
    });
  });
};

// Add to cart with user association
export const addToCart = async (product, userId) => {
  console.log(userId)
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT OR REPLACE INTO cart 
        (user_id, product_id, name, price, quantity, farm, image) 
        VALUES (?, ?, ?, ?, 
          COALESCE((SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?), 0) + 1, 
          ?, ?
        )`,
        [
          userId,
          product.id,
          product.name,
          product.price,
          // Parameters for COALESCE
          userId,
          product.id,
          // Farm and image
          product.farm,
          product.image,
        ],
        (_, result) => resolve(result),
        (_, error) => reject(error),
      );
    });
  });
};

// Get user's cart items
export const getCartItems = userId => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM cart WHERE user_id = ?',
        [userId],
        (_, {rows}) => resolve(rows.raw()),
        (_, error) => reject(error),
      );
    });
  });
};

// Update quantity for specific user
export const updateQuantity = (userId, productId, newQuantity) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [newQuantity, userId, productId],
      () => {},
      error => console.log('Error updating quantity', error),
    );
  });
};

// Remove item from user's cart
export const removeFromCart = (userId, productId) => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId],
      () => {},
      error => console.log('Error removing item', error),
    );
  });
};
