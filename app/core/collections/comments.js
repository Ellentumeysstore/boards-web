module.exports = Zeppelin.Collection.extend({
  model: require('core/models/comment'),

  subscriptions: {
    'comment:created': 'onCommentCreated'
  },

  comparator: function(board) {
    return -(new Date(board.get('date_created')).getTime());
  },

  fetchComments: function(cardId) {
    var $d = $.Deferred();

    $.getJSON('/api/cards/' + cardId + '/comments/').done(_.bind(function(comments) {
      this.reset(comments);
      $d.resolve(arguments);
    }, this)).fail(function() {
      $d.reject(arguments);
    });

    return $d.promise();
  },

  onCommentCreated: function(comment) {
    this.request('collaborators:collaborator', comment.get('created_by'), function(creator) {
      comment.set('creator', {
        name: creator.getFullName(),
        avatar: creator.get('gravatar_url')
      });
    });

    if (Z.Util.isModel(comment)) this.add(comment);
  },

  addCreatorsData: function(creators) {
    if (!creators.length) return this;

    this.each(function(comment) {
      var creator = _.where(creators, {id: comment.get('created_by')})[0];

      if (creator) {
        comment.set('creator', {
          name: creator.getFullName(),
          avatar: creator.get('gravatar_url')
        });
      }
    });

    return this;
  }
});