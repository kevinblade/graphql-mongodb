import gql from 'graphql-tag'

const FIND_BOOKS = gql`
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
            ctime
            dup_files {
                name
                path
                size
                ctime
            }
        }
    }
}`

const DELETE_BOOK = gql`
mutation DeleteBook($_id: String!) {
    deleteBook(_id: $_id)
}`

export default {
    FIND_BOOKS,
    DELETE_BOOK
}