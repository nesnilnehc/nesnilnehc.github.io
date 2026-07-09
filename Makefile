.PHONY: install dev build validate

install:
	bundle install

dev:
	bundle exec jekyll serve --livereload

build:
	bundle exec jekyll build

validate:
	ruby script/validate_content.rb
