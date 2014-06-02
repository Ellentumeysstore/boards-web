var _ = require('lodash'),
    Q = require('q'),
    s3 = require('gulp-s3'),
    git = require('git-rev'),
    gulp = require('gulp'),
    karma = require('gulp-karma'),
    gutil = require('gulp-util'),
    gzip = require("gulp-gzip"),
    brunch = require('brunch'),
    imagemin = require('gulp-imagemin'),
    runSequence = require('run-sequence'),
    environment = process.env.ENV || 'staging',
    aws = require('./aws-config')[environment];

var s3Options = function(options) {
  options = options || {};

  return _.merge(options,{
    gzippedOnly: true,
    headers: {
      'Cache-Control': 'max-age=315360000, no-transform, public'
    }
  });
};

gulp.task('build:dev', function() {
  var deferred = Q.defer();

  brunch.build({}, function() {
    deferred.resolve();
  });

  return deferred.promise;
});

gulp.task('build:prod', function() {
  var deferred = Q.defer();

  brunch.build({production: true}, function() {
    deferred.resolve();
  });

  return deferred.promise;
});

gulp.task('test:dev', ['build:dev'], function() {
  return gulp.src([
    'public/css/app.css',
    'public/js/app.js',
    'bower_components/handlebars/handlebars.js',
    'test/enviroment.js',
    'test/**/*-test.js'
  ]).pipe(karma({
    action: 'run',
    configFile: 'karma.conf.coffee'
  }));
});

gulp.task('test:prod', ['build:prod'], function() {
  return gulp.src([
    'public/css/app.css',
    'public/js/app.js',
    'bower_components/handlebars/handlebars.js',
    'test/enviroment.js',
    'test/**/*-test.js'
  ]).pipe(karma({
    action: 'run',
    browsers: ['Chrome', 'Safari', 'Firefox'],
    configFile: 'karma.conf.coffee'
  }));
});

gulp.task('deploy:js', function() {
  var deferred = Q.defer();

  git.short(function (hash) {
    gulp.src([
      'public/js/*'
    ], {read: false})
    .pipe(gzip())
    .pipe(s3(aws, s3Options({uploadPath: '/' + hash + '/js/'})))
    .on('close', function() {
      deferred.resolve();
    });
  });

  return deferred.promise;
});


gulp.task('deploy:css', function() {
  var deferred = Q.defer();

  git.short(function (hash) {
    gulp.src([
      'public/css/*'
    ], {read: false})
    .pipe(gzip())
    .pipe(s3(aws, s3Options({uploadPath: '/' + hash + '/css/'})))
    .on('close', function() {
      deferred.resolve();
    });
  });

  return deferred.promise;
});

gulp.task('deploy:images', function() {
  var deferred = Q.defer();

  git.short(function (hash) {
    gulp.src([
      'public/images/**'
    ], {read: false})
    .pipe(imagemin())
    .pipe(gzip())
    .pipe(s3(aws, s3Options({uploadPath: '/' + hash + '/images/'})))
    .on('close', function() {
      deferred.resolve();
    });
  });

  return deferred.promise;
});

gulp.task('deploy:summary', function() {
  var deferred = Q.defer();

  git.short(function(hash) {
    gutil.log('Environment:', gutil.colors.magenta(environment));
    gutil.log('Deploying to AWS bucket:', gutil.colors.magenta(aws.bucket));
    gutil.log('BOARDS_WEB_CLIENT_VERSION=' + gutil.colors.magenta(hash));
    deferred.resolve();
  });

  return deferred.promise;
});

gulp.task('deploy', function(cb) {
  runSequence('deploy:summary', 'build:prod', 'deploy:js', 'deploy:css', 'deploy:images', cb);
});
