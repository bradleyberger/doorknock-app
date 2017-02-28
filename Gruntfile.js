module.exports = function(grunt) {

// next line is for the FTP task
//require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      //options: {
      //  banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      //},
      build: {
        src: ['js/jquery.min.js', 'js/scripts.js'],
        dest: 'js/scripts-min.js'
      }
    },
      
    sass:{
      dist: {
        options: {                       // Target options
          style: 'compressed'
        },
        files: {                         // Dictionary of files
          'css/style.css': 'scss/style.scss'       // 'destination': 'source'
          //'widgets.css': 'widgets.scss' // just keep adding lines here for multiple files
        }
      }
    },
	watch: {
		uglify: {
			files: 'js/scripts.js',
			tasks: ['uglify'],
			options: {
			  spawn: false,
			},
		},
		sass: {
			files: 'scss/style.scss',
			tasks: ['sass'],
			options: {
			  spawn: false,
			},
		},
	},

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  //grunt.loadNpmTasks('grunt-ftp');

  // Default task(s).
  grunt.registerTask('default', ['uglify','sass','watch']);

};