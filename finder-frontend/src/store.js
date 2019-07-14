import Vue from 'vue'
import Vuex from 'vuex'
import gql from 'graphql-tag'
import apollo from './apolloClient'

Vue.use(Vuex)

const state = {
  isLoading: false,
  bookIds: [],
  books: {},
  total: 0
}

const mutations = {
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading
  },

  CLEAR_BOOKS(state) {
    state.bookIds = []
    state.books = {}
  },

  SET_BOOKS(state, { books, total }) {
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

    state.total = total
  }
}

const actions = {
  clear({ commit }) {
    console.time(`clear`)

    commit('CLEAR_BOOKS')

    console.timeEnd(`clear`)
  },

  async findBooks({ commit }, { name, page, size }) {
    commit('CLEAR_BOOKS')
    console.time(`findBooks ${name}, ${page}, ${size}`)

    // Follow query is using variables and aliases which are $name variable and books alias.
    const query = gql`
    query FindBooks($name: String!, $page: Int!, $size: Int!) {
      results: findBooks(name: $name, page: $page, size: $size) {
        pageInfo {
          count
        }
        books {
          _id
          name
          path
          size
          mtime
          dup_files {
            name
            path
            size
            mtime
          }
        }
      }
    }`

    const variables = {
      name,
      page,
      size
    }

    commit('SET_LOADING', true)

    const response = await apollo.query({
      query, variables
    })

    if (response.data.results.length > 0) {
      const { books, pageInfo } = response.data.results[0]
      commit('SET_BOOKS', { books, total: pageInfo.count })
      console.log(response.data.results)
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
  }
}

export default new Vuex.Store({ state, mutations, actions, getters })
