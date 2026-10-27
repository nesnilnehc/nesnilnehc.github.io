.PHONY: install dev build validate test test-poetry test-browser

install:
	bundle install

dev:
	bundle exec jekyll serve --livereload

build:
	bundle exec jekyll build

validate:
	ruby script/validate_content.rb

test:
	node --test script/like-count.test.cjs

test-poetry: build
	node --test script/poetry-periods.test.cjs

test-browser:
	node --test script/analytics-browser.test.cjs
