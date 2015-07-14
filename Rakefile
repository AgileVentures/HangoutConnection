require 'jasmine'
load 'jasmine/tasks/jasmine.rake'

desc 'jasmine:ci with compile'
task :test do
  system 'coffee -c $(find . -name "*.coffee" | sed "s/.\///" | sed ":a;N;$!ba;s/\n/ /g")'
  Rake::Task["jasmine:ci"].invoke
  system "ruby lib/build.rb"
end

task default: :test
