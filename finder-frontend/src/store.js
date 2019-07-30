import Vue from 'vue'
import Vuex from 'vuex'
import apollo from './apolloClient'
import gql from './gql'

Vue.use(Vuex)

const state = {
  isLoading: false,
  books: {},
  total: 0,
  query: {
    name: '',
    page: 1,
    size: 10
  },
  updated: false
}

const mutations = {
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading
  },

  CLEAR_BOOKS(state) {
    state.books = {}
    state.total = 0
    state.query = {
      name: '',
      page: 1,
      size: 10
    }
  },

  SET_BOOKS(state, { books, total, query }) {
    state.books = []
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

    state.total = total
    state.query = query
  },

  DELETE_BOOK(state, { _id }) {
    delete state.books[_id]
    state.total--
  },

  UPDATED(state, { updated }) {
    state.updated = updated
  }
}

const actions = {
  clear({ commit }) {
    console.time(`clear`)

    commit('CLEAR_BOOKS')

    console.timeEnd(`clear`)
  },

  async deleteBook({ commit, state }, { _id }) {
    console.time(`deleteBook ${_id}`)

    const deleteVars = {
      _id
    }

    const queryVars = {
      name: state.query.name,
      page: state.query.page,
      size: state.query.size
    }

    commit('SET_LOADING', true)

    commit('UPDATED', { updated: false })

    const response = await apollo.mutate({
      mutation: gql.DELETE_BOOK,
      variables: deleteVars,
      update: (store, { data: { deleteBook } }) => {
        if (deleteBook) {
          // eslint-disable-next-line
          // Read the data from our cache for this query.
          const data = store.readQuery({
            query: gql.FIND_BOOKS,
            variables: queryVars
          })
          data.results[0].books = data.results[0].books.filter(book => book._id !== _id)
          data.results[0].pageInfo.count--
          store.writeQuery({
            query: gql.FIND_BOOKS,
            data
          })
        }
      }
    })

    if (response.data.deleteBook) {
      commit('DELETE_BOOK', { _id })
      commit('UPDATED', { updated: true })
    }

    commit('SET_LOADING', false)

    console.timeEnd(`deleteBook ${_id}`)
  },

  async findBooks({ commit }, { name, page, size }) {
    console.time(`findBooks ${name}, ${page}, ${size}`)

    // Follow query is using variables and aliases which are $name variable and books alias.

    const queryVars = {
      name,
      page,
      size
    }

    commit('SET_LOADING', true)

    const response = await apollo.query({
      query: gql.FIND_BOOKS,
      variables: queryVars,
      fetchPolicy: 'network-only'
    })

    if (response.data.results.length > 0) {
      const { books, pageInfo } = response.data.results[0]
      commit('SET_BOOKS', { books, total: pageInfo.count, query: { name, page, size } })
    } else {
      commit('SET_BOOKS', { books: [], total: 0, query: { name, page, size } })
    }

    commit('SET_LOADING', false)

    console.timeEnd(`findBooks ${name}, ${page}, ${size}`)
  }
}

const getters = {
  isLoading(state) {
    return state.isLoading
  },

  books(state) {
    return Object.values(state.books)
  },

  total(state) {
    return state.total
  },

  updated(state) {
    return state.updated
  }
}

export default new Vuex.Store({ state, mutations, actions, getters })
