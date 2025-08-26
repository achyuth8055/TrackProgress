import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import connectDB from './config/db.js';
import authResolver from './resolvers/resolver.js'; // Fixed import path
import User from './models/User.js'; // Fixed import path

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// CORS configuration for frontend connection - Fixed to include multiple origins
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'https://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' })); // Added size limit for security

// Connect to MongoDB Atlas
connectDB();

// GraphQL Schema - Created inline since schema.graphql is missing
const typeDefs = `
  type User {
    id: ID!
    firebaseUid: String!
    name: String!
    email: String!
    avatar: String
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    health: String
  }

  type Mutation {
    loginWithGoogle(idToken: String!): AuthPayload!
  }
`;

// GraphQL Resolvers
const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) {
        throw new Error('Authentication required');
      }
      return user;
    },
    health: () => "Server is running!"
  },
  Mutation: {
    ...authResolver.Mutation,
  },
};

// Apollo Server Setup with Context - Enhanced error handling
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const context = { req };

    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return context;
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-__v');
      
      if (!user) {
        console.warn(`Token valid but user ${decoded.userId} not found`);
        return context;
      }

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
    }

    return context;
  },
  // Enhanced error formatting
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return {
      message: error.message,
      code: error.extensions?.code || 'INTERNAL_ERROR',
      path: error.path
    };
  }
});

// Health check endpoint - Enhanced
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Enhanced /chat endpoint with better error handling and rate limiting
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  // Input validation
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      reply: '⚠️ Please provide a valid message.'
    });
  }

  if (message.length > 1000) {
    return res.status(400).json({
      reply: '⚠️ Message too long. Please keep it under 1000 characters.'
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
              'Keep responses concise and actionable. ' +
              'Never mention DeepSeek or any underlying model.',
          },
          { role: 'user', content: message.trim() },
        ],
        max_tokens: 500, // Limit response length
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API Error:', response.status, errorText);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    let reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      console.warn('No content in DeepSeek response:', data);
      reply = '⚠️ I couldn\'t generate a response. Please try again.';
    }

    // Clean up the response
    reply = reply
      .replace(/DeepSeek/gi, 'Study Tracker Assistant')
      .replace(/AI model/gi, 'Study Tracker Assistant')
      .trim();

    res.json({ reply });
  } catch (err) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({
      reply: '❌ Error connecting to Study Tracker Assistant. Please try again later.',
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start Apollo Server and apply middleware
async function startServer() {
  try {
    await server.start();
    server.applyMiddleware({ 
      app, 
      path: '/graphql',
      cors: false // We handle CORS above
    });
    
    const PORT = process.env.PORT || 3001;
    const serverInstance = app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`🚀 GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
      console.log(`💬 Chat endpoint: http://localhost:${PORT}/chat`);
      console.log(`❤️ Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      serverInstance.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();