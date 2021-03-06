module.exports = Zeppelin.Model.extend({
  defaults: function() {
    return {
      date_created: _.now(),
      date_modified: _.now(),
      html_url: '',
      download_html_url: '',
      original_html_url: '',
      featured: false,
      created_by: {
        id: App.User.id,
        username: App.User.get('username'),
        gravatar_url: App.User.get('gravatar_url')
      },
      modified_by: {
        id: App.User.id,
        username: App.User.get('username'),
        gravatar_url: App.User.get('gravatar_url')
      },
      is_selected: false,
      comments_count: 0
    };
  },

  localAttributes: ['is_selected'],

  validations: {
    name: {
      isEmpty: false,
      message: 'Every card requires at least a name.'
    },

    board: {
      isRequired: true,
      message: 'Every card must be tied to a board.'
    },

    content: function(content) {
      if (this.get('type') !== 'stack' && !content) {
        return 'Every card requires some type of content.';
      }
    }
  },

  url: function() {
    var url = App.API_URL + '/cards/';
    return this.isNew() ? url : url + this.id + '/';
  },

  getUrl: function(type) {
    var url;

    type = type || 'card';

    if (type === 'card') {
      url = this.get('html_url');
    } else if (type === 'download') {
      url = this.get('download_html_url');
    }

    return url.replace(window.location.origin, '');
  },

  select: function(options) {
    options = options || { navigate: true };

    this.set('is_selected', true).trigger('selected');
    this.broadcast('card:selected', this);

    if (options.navigate) {
      this.broadcast('router:navigate', this.getUrl(), {
        trigger: false
      });
    }
  },

  isNote: function() {
    return this.get('type') === 'note';
  },

  isFile: function() {
    return this.get('type') === 'file';
  },

  download: function() {
    return $.getJSON(this.url() + 'download/');
  },

  originalThumbnail: function() {
    return $.getJSON(this.url() + 'original_thumbnail/');
  }
});
