<template>
  <div class="search">
    <h1>{{ msg }}</h1>
    <p>Type a search text a book name to want find.</p>
    <el-input
      class="search-input"
      placeholder="Please type a search text"
      v-model="search"
      clearable
      @clear="onClear"
    ></el-input>
    <el-button type="primary" icon="el-icon-search" @click="onSubmit">Search</el-button>
    <el-table :data="books" stripe style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-table :data="props.row.dup_files" stripe style="width: 100%">
            <el-table-column prop="path" label="Duplicated Path"></el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="Name" width="380"></el-table-column>
      <el-table-column prop="dup_count" width="20"></el-table-column>
      <el-table-column prop="size" label="Size" width="100"></el-table-column>
      <el-table-column prop="path" label="Path"></el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination
        v-show="total > 0"
        :current-page="queryParams.page"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="queryParams.size"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChangePagination"
        @current-change="handleCurrentChangePagination"
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Book from './Book'

export default {
  name: 'Search',

  props: {
    msg: String
  },

  components: {
    Book
  },

  data() {
    return {
      search: '',
      queryParams: {
        page: 1,
        size: 10
      }
    }
  },

  methods: {
    ...mapActions(['clear', 'findBooks']),

    onSubmit() {
      this.clear()
      this.findBooks(this.search)
    },

    onClear() {
      this.clear()
    },

    async handleSizeChangePagination(val) {
      this.queryParams.size = val
      await this.findBooks(this.search, this.queryParams)
    },

    async handleCurrentChangePagination(val) {
      this.queryParams.page = val
      await this.findBooks(this.search, this.queryParams)
    }
  },

  computed: {
    ...mapGetters(['isLoading', 'books']),

    total() {
      return this.books.length
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.search-input {
  width: 600px;
  margin-top: 300px;
  margin-right: 8px;
}
</style>
