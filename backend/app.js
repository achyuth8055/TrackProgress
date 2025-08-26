import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import 'dotenv/config';  // ✅ Keep only this line for dotenv
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import connectDB from './config/db.js';
import authResolver from './resolvers/authResolver.js';
import admin from './config/firebase.js';
import User from './models/User.js';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// CORS configuration for frontend connection
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());


connectDB();

const typeDefs = readFileSync(join(__dirname, 'schema/schema.graphql'), 'utf-8');

// GraphQL Resolvers
const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) {
        throw new Error('Authentication required');
      }
      return user;
    },
  },
  Mutation: {
    ...authResolver.Mutation,
  },
};

// Apollo Server Setup with Context
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    // Initialize context object
    const context = { req };

    // Extract Authorization header
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return context; // No token provided, return context without user
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '');

    try {
      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

      // Fetch user from MongoDB using userId from JWT
      const user = await User.findById(decoded.userId).select('-__v');
      if (!user) {
        throw new Error('User not found');
      }

      // Attach user to context
      context.user = {
        id: user._id.toString(),
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt.toISOString(),
      };
    } catch (error) {
      console.error('JWT verification error:', error.message);
      // Don't throw; allow unauthenticated access to public resolvers
    }

    return context;
  },
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Existing /chat endpoint with better error handling
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      reply: '⚠️ Please provide a message.'
    });
  }

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              "You are Achyuth's Study Tracker Assistant. " +
              'Always provide helpful study-related answers. ' +
              'Never mention DeepSeek or any underlying model.',
          },
          { role: 'user', content: message },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('DeepSeek raw response:', JSON.stringify(data, null, 2));

    let reply =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.delta?.content ||
      null;

    if (!reply) {
      reply = '⚠️ I couldn\'t generate a response. Please try again.';
    }

    reply = reply
      .replace(/DeepSeek/gi, 'Study Tracker Assistant')
      .replace(/AI model/gi, 'Study Tracker Assistant');

    res.json({ reply });
  } catch (err) {
    console.error('DeepSeek API error:', err);
    res.status(500).json({
      reply: '❌ Error connecting to Study Tracker Assistant. Please try again later.',
    });
  }
});

// Start Apollo Server and apply middleware
async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
  
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🚀 GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});