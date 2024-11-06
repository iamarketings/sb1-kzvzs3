import db from '../database/db.js';

export class Chatbot {
  static async create({ userId, name, description, settings }) {
    try {
      const result = await db.run(
        'INSERT INTO chatbots (user_id, name, description, settings) VALUES (?, ?, ?, ?)',
        [userId, name, description, JSON.stringify(settings)]
      );
      return result.id;
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(userId) {
    return db.all('SELECT * FROM chatbots WHERE user_id = ?', [userId]);
  }

  static async findById(id) {
    return db.get('SELECT * FROM chatbots WHERE id = ?', [id]);
  }

  static async update(id, { name, description, settings }) {
    return db.run(
      'UPDATE chatbots SET name = ?, description = ?, settings = ? WHERE id = ?',
      [name, description, JSON.stringify(settings), id]
    );
  }

  static async delete(id) {
    return db.run('DELETE FROM chatbots WHERE id = ?', [id]);
  }

  static generateEmbedCode(chatbotId) {
    return `
<script>
  window.AIChatbot = {
    id: "${chatbotId}",
    server: "${process.env.SERVER_URL || 'http://localhost:3000'}"
  };
</script>
<script src="/js/chatbot-embed.js" async></script>
    `.trim();
  }
}