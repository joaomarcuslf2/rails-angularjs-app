require 'sinatra' # gem
set :public_folder, '.'
set :session, true
set :bind, '0.0.0.0'
set :server, %w[puma thin mongrel webrick]
set :port, 8000
get '/' do
  File.read('index.html')
end

