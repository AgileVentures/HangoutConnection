xml_template = File.read('./lib/template.xml')
html = File.read('./lib/websiteone.html')
js_main = File.read('./lib/HangoutConnection.js')
js_extra = File.read('./lib/timer.js')
output = File.open('./public/websiteone.xml', 'w')

html.gsub!('$JS_PLACEHOLDER', js_extra.to_s + js_main.to_s)
xml_template.gsub!('$HTML_PLACEHOLDER', html.to_s)

output << xml_template.to_s
output.close
