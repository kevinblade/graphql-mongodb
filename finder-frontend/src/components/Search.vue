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
      style="ime-mode:auto;"
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
            <el-table-column prop="ctime" label="Creation Date" width="200">
              <template slot-scope="scope">
                <span class="highlight-col">{{ ctime(scope.row.ctime) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="path" label="Duplicated Path">
              <template slot-scope="scope">
                <a
                  :href="`file:///` + scope.row.path"
                  class="highlight-col"
                >{{ scope.row.path.replace('/Volumes/Second_Disk/Dropbox/Docs/', '').replace(/\//g, ' / ') }}</a>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="Name" width="450">
        <template slot-scope="scope">
          <a :href="`file:///` + scope.row.path" class="highlight-col">{{ scope.row.name }}</a>
        </template>
      </el-table-column>
      <el-table-column prop="reading" label="Reading" width="80">
        <template slot-scope="scope">
          <span class="highlight-col">{{ scope.row.reading ? 'true' : 'false' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="dup_count" width="20"></el-table-column>
      <el-table-column prop="size" label="Size" width="100">
        <template slot-scope="scope">
          <span class="highlight-col">{{ size(scope.row.size) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="ctime" label="Creation Date" width="200">
        <template slot-scope="scope">
          <span class="highlight-col">{{ ctime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="Path">
        <template slot-scope="scope">
          <a
            :href="`file:///` + dirname(scope.row.path)"
            class="highlight-col"
          >{{ dirname(scope.row.path).replace('/Volumes/Second_Disk/Dropbox/Docs/', '').replace(/\//g, ' / ') }}</a>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="Operations" width="220">
        <template slot-scope="scope">
          <el-row>
            <el-col :span="12">
              <el-button
                @click.native.prevent="handleClickToggleReadBook(scope.$index)"
                :type="scope.row.reading ? 'warning' : 'primary'"
                size="small"
              >{{ scope.row.reading ? 'Stop Read' : 'Start Read' }}</el-button>
            </el-col>
            <el-col :span="12">
              <el-button
                @click.native.prevent="handleClickDeleteBook(scope.$index)"
                type="danger"
                size="small"
              >Delete</el-button>
            </el-col>
          </el-row>
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
import path from 'path'
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

  watch: {
    updated(val) {
      if (val) {
        this.$nextTick().then(() => {
          this.findBooksWithEncoded()
        })
      }
    }
  },

  methods: {
    ...mapActions(['clear', 'findBooks', 'deleteBook', 'updateBook']),

    findBooksWithEncoded() {
      this.queryParams.page = 1
      this.queryParams = JSON.parse(JSON.stringify(this.queryParams))
      this.findBooks(this.queryParams)
    },

    handleClickSearch() {
      this.$nextTick().then(() => {
        this.findBooksWithEncoded()
      })
    },

    handleClickDeleteBook(index) {
      const book = this.books[index]
      this.deleteBook({ _id: book._id })
    },

    handleClickToggleReadBook(index) {
      const book = this.books[index]
      this.updateBook({ _id: book._id, book: { reading: !book.reading } })
    },

    // handleClickPath(event) {
    //   event.preventDefault()
    //   console.log(`VUE_APP_BACKEND_HOST = ${process.env.VUE_APP_BACKEND_HOST}`)
    //   const url = `http://${
    //     process.env.VUE_APP_BACKEND_HOST
    //   }:4000/${event.target.text.replace(/ \/ /g, '/')}`
    //   console.log(url)
    //   window.open(url)
    // },

    checkEnter(event) {
      console.log(event)
      if (event.keyCode === 13) {
        this.$nextTick().then(() => {
          this.findBooksWithEncoded()
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

    ctime(value) {
      const mt = moment(parseInt(value))
      return mt.format('YYYY-MM-DD HH:mm')
    },

    size(value) {
      return prettyBytes(parseInt(value))
    },

    dirname(value) {
      return path.dirname(value)
    }
  },

  computed: {
    ...mapGetters(['isLoading', 'books', 'total', 'updated'])
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
