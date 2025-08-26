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

type Post {
  id: ID!
  group: String!
  author: User!
  avatar: String!
  time: String!
  content: String!
  replies: [Reply!]!
  likes: Int!
}

type Reply {
  id: ID!
  author: User!
  content: String!
  time: String!
}

type Query {
  me: User
  posts(group: String!): [Post!]!
}

type Mutation {
  loginWithGoogle(idToken: String!): AuthPayload!
  createPost(group: String!, content: String!): Post!
  createReply(postId: ID!, content: String!): Reply!
  likePost(postId: ID!): Post!
}