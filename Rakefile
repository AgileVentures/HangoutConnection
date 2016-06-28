require 'jasmine'
load 'jasmine/tasks/jasmine.rake'

desc 'jasmine:ci with compile'
task test: [:compile] do
  Rake::Task["jasmine:ci"].invoke
end

desc 'convert the coffeescript to javascript'
task :compile do
  system 'coffee -c $(find . -name "*.coffee" | sed "s/.\///" | sed ":a;N;$!ba;s/\n/ /g")'
end

desc 'merges all files and places in public dir for consumption by hangout'
task deploy: [:compile, :test]do
  system 'ruby lib/build.rb'
end

task default: :test
