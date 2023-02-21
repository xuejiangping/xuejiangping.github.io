const { createApp } = Vue
let a = createApp({

  data() {
    return {
      count: 0
    }
  },
  methods: {
    add() { this.count++ }
  },

}).mount('#app')


console.log(a)