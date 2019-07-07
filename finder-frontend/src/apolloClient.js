import ApolloClient from 'apollo-boost'

export default new ApolloClient({
  // You should use an absolute URL here
  uri: 'http://localhost:4000/graphql'
})
