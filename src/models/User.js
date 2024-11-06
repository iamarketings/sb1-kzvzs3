import bcrypt from 'bcryptjs';
import db from '../database/db.js';

export class User {
  static async create({ username, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const result = await db.run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
      );
      return result.id;
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Username or email already exists');
      }
      throw error;
    }
  }

  static async findByEmail(email) {
    return db.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  static async findById(id) {
    return db.get('SELECT * FROM users WHERE id = ?', [id]);
  }

  static async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}