describe('Helpers', function() {
  before(function() {
    require('lib/helpers');
    Backbone.history.start({pushState: false});
    this.navigateSpy = sinon.spy(Backbone.History.prototype, 'navigate');
    $('#application').append('<a id=route href=boards data-route=boards></a>');
  });

  after(function() {
    Backbone.history.stop();
    Backbone.History.prototype.navigate.restore();
    $('#application').remove('#route');
  });

  describe('_.createController', function() {
    it('should create a new controller view based on the given path.', function() {
      var controller = _.createController('accounts');
      expect(controller).to.exist;
      expect(controller.name).to.equal('AccountsController');
    });
  });

  describe('_.createView', function() {
    it('should create a new view based on the given path.', function() {
      var view = _.createView('signin-form');
      expect(view).to.exist;
      expect(view.name).to.equal('SigninForm');
    });
  });

  describe('_.createModel', function() {
    it('should create a new model based on the given path.', function() {
      var model = _.createModel('user');
      expect(model).to.exist;
      expect(model.name).to.equal('User');
    });
  });

  describe('_.createCollection', function() {
    it('should create a new collection based on the given path.', function() {
      var collection = _.createCollection('boards');
      expect(collection).to.exist;
      expect(collection.name).to.equal('Boards');
    });
  });

  describe('_.decodeJWT', function() {
    it('should decode a JSON Web Token.', function() {
      var decoded = _.decodeJWT(JWT_TEST_TOKEN);
      expect(decoded.id).to.equal(2);
      expect(decoded.type).to.equal('PasswordReset');
      expect(decoded.token_version).to.equal('a22c3b1d-dd8d-49ee-9d06-d062f5f47456');
    });
  });

  describe('a[data-route]', function() {
    it('should trigger a route change on click.', function() {
      $('#route').click();
      expect(this.navigateSpy).to.have.been.calledWith('boards', {trigger: true});
    });
  });
});
