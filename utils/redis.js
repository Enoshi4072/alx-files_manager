// utils/redis.js

import redis from 'redis';
import { promisify } from 'util';

// Redis client instance
const client = redis.createClient();

// Promisify Redis client methods
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const delAsync = promisify(client.del).bind(client);

class RedisClient {
    constructor() {
        // Error handling for Redis client
        client.on('error', (err) => {
            console.error('Redis client error:', err);
        });
    }

    // Check if connection to Redis is alive
    isAlive() {
        return client.connected;
    }

    // Get value from Redis for a given key
    async get(key) {
        try {
            const value = await getAsync(key);
            return value;
        } catch (error) {
            console.error('Error getting value from Redis:', error);
            return null;
        }
    }

    // Set value in Redis for a given key with an expiration (in seconds)
    async set(key, value, durationInSeconds) {
        try {
            await setAsync(key, value, 'EX', durationInSeconds);
        } catch (error) {
            console.error('Error setting value in Redis:', error);
        }
    }

    // Delete value from Redis for a given key
    async del(key) {
        try {
            await delAsync(key);
        } catch (error) {
            console.error('Error deleting value from Redis:', error);
        }
    }
}

// Create and export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;
