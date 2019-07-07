import Vue from 'vue'
import Vuex from 'vuex'
import gql from 'graphql-tag'
import apollo from './apolloClient'

Vue.use(Vuex)

const state = {
  isLoading: false,
  bookIds: [],
  books: {}
}

const mutations = {
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading
  },

  CLEAR_BOOKS(state) {
    state.bookIds = []
    state.books = {}
  },

  SET_BOOKS(state, { books }) {
    const ids = books.map(x => x._id)

    for (let id in ids) {
      if (!state.bookIds.includes(ids[id])) {
        state.bookIds.push(ids[id])
      }
    }

    for (let l in books) {
      const book = books[l]
      state.books = {
        ...state.books,
        [book._id]: {
          ...state.books[book._id],
          dup_count: book.dup_files.length,
          ...book
        },
      }
    }
  }
}

const actions = {
  clear({ commit }) {
    console.time(`clear`)

    commit('CLEAR_BOOKS')

    console.timeEnd(`clear`)
  },

  async findBooks({ commit }, name) {
    console.time(`findBooks ${name}`)

    // Follow query is using variables and aliases which are $name variable and books alias.
    const query = gql`
    query FindBooks($name: String!) {
      books: findBooks(name: $name) {
        _id
        name
        path
        size
        dup_files {
          name
          path
          size
        }
      }
    }`

    const variables = {
      name
    }

    commit('SET_LOADING', true)

    const response = await apollo.query({
      query, variables
    })

    const { books } = response.data
    commit('SET_BOOKS', { books })

    commit('SET_LOADING', false)

    console.log(response.data.books)
    console.timeEnd(`findBooks ${name}`)
  }
}

const getters = {
  isLoading(state) {
    return state.isLoading
  },

  books(state) {
    return Object.values(state.books)
  }
}

export default new Vuex.Store({ state, mutations, actions, getters })
