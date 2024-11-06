import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new sqlite3.Database(join(__dirname, 'database.sqlite'));

const initDb = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      // Drop existing tables if they exist
      db.run("DROP TABLE IF EXISTS chatbots");
      db.run("DROP TABLE IF EXISTS users");

      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Chatbots table
      db.run(`CREATE TABLE IF NOT EXISTS chatbots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        settings TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      try {
        // Create test user
        const testPassword = await bcrypt.hash('test123', 10);
        db.run(`INSERT INTO users (username, email, password) 
                VALUES ('test', 'test@example.com', ?)`, 
                [testPassword], function(err) {
          if (err) {
            console.error('Error creating test user:', err);
            reject(err);
          } else {
            console.log('Base de données initialisée avec succès!');
            console.log('Utilisateur test créé:');
            console.log('- Email: test@example.com');
            console.log('- Mot de passe: test123');
            resolve();
          }
        });
      } catch (error) {
        console.error('Error hashing password:', error);
        reject(error);
      }
    });
  });
};

// Initialize database
initDb().catch(console.error);