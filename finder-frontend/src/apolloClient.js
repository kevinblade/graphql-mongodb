import ApolloClient from 'apollo-boost'

export default new ApolloClient({
  // You should use an absolute URL here
  uri: `http://${process.env.VUE_APP_BACKEND_HOST}:4000/graphql`
})
