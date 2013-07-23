require 'sinatra'

configure do
	set :public_folder, File.dirname(__FILE__)
end

get '/' do
  File.new('index.html').readlines
end