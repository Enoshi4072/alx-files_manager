import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db'; // Assuming dbClient is imported correctly

export default class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const credentials = Buffer.from(authHeader.substring(6), 'base64').toString().split(':');
    const email = credentials[0];
    const password = sha1(credentials[1]);

    // Check if email and password match in the database
    const user = await dbClient.db.collection('users').findOne({ email, password });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    const key = `auth_${token}`;

    // Store the user ID in Redis with the generated token for 24 hours
    redisClient.set(key, user._id.toString(), 86400); // Set expiration time in seconds

    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Delete the token from Redis
    redisClient.del(key);

    return res.status(204).end();
  }
}
