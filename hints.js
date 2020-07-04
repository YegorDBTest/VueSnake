class Hints {
  constructor(items) {
    this._panel = new Vue({
      el: '#hints-panel',
      data: {
        get current() {
          return this.items[this.index];
        },
        get position() {
          return `${this.index + 1}/${this.items.length}`;
        },
        items: items,
        index: 0,
      },
      methods: {
        previous: function() {
          if (this.index == 0) {
            this.index = this.items.length - 1;
          } else {
            this.index--;
          }
        },
        next: function() {
          if (this.index == this.items.length - 1) {
            this.index = 0;
          } else {
            this.index++;
          }
        },
      }
    });
  }
}
