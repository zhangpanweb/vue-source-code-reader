var app = new Vue({
  el: '#app',
  render: function (createElement) {
    return createElement('span', {
       attrs: {
          id: 'bbb'
        },
    }, this.message)
  },
  data: {
    message: 'Hello Vue!'
  }
})