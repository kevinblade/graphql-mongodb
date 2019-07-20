<template>
  <div class="search">
    <h1>{{ msg }}</h1>
    <p>Type a search text a book name to want find.</p>
    <el-input
      class="search-input"
      placeholder="Please type a search text"
      v-model="queryParams.name"
      clearable
      @keyup.enter.native="checkEnter"
      @clear="handleClear"
    ></el-input>
    <el-button type="primary" icon="el-icon-search" @click="handleClickSearch">Search</el-button>
    <el-table :data="books" stripe style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-table :data="props.row.dup_files" stripe style="width: 100%">
            <el-table-column prop="size" label="Size" width="100">
              <template slot-scope="scope">
                <span class="highlight-col">{{ size(scope.row.size) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="mtime" label="Modification Date" width="200">
              <template slot-scope="scope">
                <span class="highlight-col">{{ mtime(scope.row.mtime) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="path" label="Duplicated Path">
              <template slot-scope="scope">
                <a
                  class="highlight-col"
                  @click="handleClickPath"
                >{{ scope.row.path.replace('/Volumes/Second_Disk/Dropbox/Docs/', '').replace(/\//g, ' / ') }}</a>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="Name" width="550">
        <template slot-scope="scope">
          <span class="highlight-col">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="dup_count" width="20"></el-table-column>
      <el-table-column prop="size" label="Size" width="100">
        <template slot-scope="scope">
          <span class="highlight-col">{{ size(scope.row.size) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="mtime" label="Modification Date" width="200">
        <template slot-scope="scope">
          <span class="highlight-col">{{ mtime(scope.row.mtime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="Path">
        <template slot-scope="scope">
          <a
            class="highlight-col"
            @click="handleClickPath"
          >{{ scope.row.path.replace('/Volumes/Second_Disk/Dropbox/Docs/', '').replace(/\//g, ' / ') }}</a>
        </template>
      </el-table-column>
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
import moment from 'moment'
import prettyBytes from 'pretty-bytes'
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
      queryParams: {
        name: '',
        page: 1,
        size: 10
      }
    }
  },

  methods: {
    ...mapActions(['clear', 'findBooks']),

    handleClickSearch() {
      this.clear()
      this.queryParams.page = 1
      this.$nextTick().then(() => {
        this.findBooks(this.queryParams)
      })
    },

    handleClickPath(event) {
      event.preventDefault()
      console.log(`VUE_APP_BACKEND_HOST = ${process.env.VUE_APP_BACKEND_HOST}`)
      const url = `http://${
        process.env.VUE_APP_BACKEND_HOST
      }:4000/${event.target.text.replace(/ \/ /g, '/')}`
      console.log(url)
      window.open(url)
    },

    checkEnter(event) {
      console.log(event)
      if (event.keyCode === 13) {
        this.clear()
        this.queryParams.page = 1
        this.$nextTick().then(() => {
          this.findBooks(this.queryParams)
        })
      }
    },

    handleClear() {
      this.clear()
      this.queryParams.page = 1
    },

    async handleSizeChangePagination(val) {
      this.queryParams.size = val
      await this.findBooks(this.queryParams)
    },

    async handleCurrentChangePagination(val) {
      this.queryParams.page = val
      await this.findBooks(this.queryParams)
    },

    mtime(value) {
      const mt = moment(parseInt(value))
      return mt.format('YYYY-MM-DD HH:mm')
    },

    size(value) {
      return prettyBytes(parseInt(value))
    }
  },

  computed: {
    ...mapGetters(['isLoading', 'books', 'total'])
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
  margin-top: 50px;
  margin-right: 8px;
}
.highlight-col {
  font-weight: bold;
}
</style>
