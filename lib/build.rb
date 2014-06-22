require 'debugger'
xml_template = File.read('./lib/template.xml')
html = File.read('./lib/websiteone.html')
js = File.read('./lib/HangoutConnection.js')
output = File.open('./public/websiteone.xml', 'w')

html.gsub!('$JS_PLACEHOLDER',js.to_s)
xml_template.gsub!('$HTML_PLACEHOLDER', html.to_s)

output << xml_template.to_s
output.close
