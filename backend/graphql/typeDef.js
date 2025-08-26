import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type User {
    id: ID!
    firebaseUid: String!
    name: String!
    email: String!
    avatar: String
    tasks: [Task!]!
    studySessions: [StudySession!]!
    preferences: UserPreferences!
    stats: UserStats!
    createdAt: String!
    updatedAt: String!
    lastLoginAt: String
  }

  type Task {
    id: ID!
    title: String!
    description: String
    completed: Boolean!
    priority: Priority!
    dueDate: String
    category: String!
    tags: [String!]!
    estimatedMinutes: Int
    createdAt: String!
    updatedAt: String!
  }

  type StudySession {
    id: ID!
    subject: String!
    topic: String!
    duration: Int!
    notes: String
    difficulty: Difficulty!
    completed: Boolean!
    startTime: String
    endTime: String
    createdAt: String!
    updatedAt: String!
  }

  type UserPreferences {
    theme: Theme!
    notifications: Boolean!
    dailyStudyGoal: Int!
    timezone: String!
  }

  type UserStats {
    totalStudyTime: Int!
    totalTasks: Int!
    completedTasks: Int!
    currentStreak: Int!
    longestStreak: Int!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  enum Priority {
    LOW
    MEDIUM
    HIGH
  }

  enum Difficulty {
    EASY
    MEDIUM
    HARD
    EXPERT
  }

  enum Theme {
    LIGHT
    DARK
    GRADIENT
  }

  input TaskInput {
    title: String!
    description: String
    priority: Priority = MEDIUM
    dueDate: String
    category: String = "general"
    tags: [String!] = []
    estimatedMinutes: Int
  }

  input TaskUpdateInput {
    title: String
    description: String
    completed: Boolean
    priority: Priority
    dueDate: String
    category: String
    tags: [String!]
    estimatedMinutes: Int
  }

  input StudySessionInput {
    subject: String!
    topic: String!
    duration: Int!
    notes: String
    difficulty: Difficulty!
    completed: Boolean = false
  }

  input UserPreferencesInput {
    theme: Theme
    notifications: Boolean
    dailyStudyGoal: Int
    timezone: String
  }

  type Query {
    me: User
    tasks(limit: Int = 50, offset: Int = 0): [Task!]!
    task(id: ID!): Task
    studySessions(limit: Int = 20, offset: Int = 0): [StudySession!]!
    studySession(id: ID!): StudySession
    health: String
  }

  type Mutation {
    loginWithGoogle(idToken: String!): AuthPayload!
    signup(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    
    createTask(input: TaskInput!): Task!
    updateTask(id: ID!, input: TaskUpdateInput!): Task!
    deleteTask(id: ID!): Boolean!
    toggleTaskComplete(id: ID!): Task!
    
    createStudySession(input: StudySessionInput!): StudySession!
    updateStudySession(id: ID!, input: StudySessionInput!): StudySession!
    deleteStudySession(id: ID!): Boolean!
    
    updateProfile(name: String, avatar: String): User!
    updatePreferences(input: UserPreferencesInput!): User!
  }
`;

export default typeDefs;