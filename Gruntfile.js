/**
 * Created by doyen on 2015/10/24.
 */
module.exports = function(grunt) {
	var data = grunt.file.readJSON("package.json");
	console.log(typeof data);
	// 给grunt添加些设置
	grunt.initConfig({
		uglify: {
			options: {
				banner: "",
				beautify: false
			},
			my_target: {
				files: {
					'dest/slider/slider.min.js': ['dest/slider.js']
				}
			}
		},
		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1
			},
			target: {
				files: {
					'dest/slider/slider.min.css': ['slider/slider.css']
				}
			}
		},
		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: ['slider/slider.js'],
				dest: 'dest/slider.js'
			}
		},
		clean: {
			build: ["dest/slider.js"],  //定制子任务 通过clean:子任务名  来执行不同的任务
			release: ["dist/slider.js"] //若clean 则执行所有的任务
		},
		copy: {
			file: {
				src: ['index.html', 'index.css', 'jquery-1.8.3.js', 'img/*'],
				dest: 'dest/'
			},
			folder: {
				expand: true,
				src: 'img',
				dest: 'dest/img',
				flatten: true,
				filter: 'isFile'
			}
		}
	});

	// 载入 "uglify" 插件任务
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');

	// 定义默认需要执行的任务
	grunt.registerTask('js', ['concat', 'uglify', 'clean:build']);
	grunt.registerTask('css', ['cssmin']);
	grunt.registerTask('build', ['css', 'js', 'copy']);
};