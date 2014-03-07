module.exports = Zeppelin.Collection.extend({
  url: '/api/boards/',

  name: 'Boards',

  model: require('models/board'),

  subscriptions: {
    'board:selected': 'onBoardSelected'
  },

  setCurrent: function(slug) {
    this.current = slug ? this.findWhere({slug: slug}) : this.first();
    this.current = this.current && this.current.id ? this.current.id : null;
    App.Cache.set('current_board', this.current).saveCache();
    return this;
  },

  getCurrent: function() {
    return this.current ? this.get(this.current) : null;
  },

  getSlug: function() {
    var board = this.get(this.current);
    return board ? board.get('slug') : '';
  },

  onBoardSelected: function(board) {
    if (board) this.setCurrent(board.get('slug'));
    return this;
  }
});
