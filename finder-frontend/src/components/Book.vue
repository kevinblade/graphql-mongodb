<template>
  <div class="book">
    <div class="box">
      <article class="media">
        <div class="media-content">
          <div class="content">
            <p>
              <strong>{{book.name}}</strong>
              <small>{{book.size}}</small>
              <br />
              {{book.path}}
            </p>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Book',

  props: {
    book: Object
  }
}
</script>

<style lang="sass" scoped>

</style>


