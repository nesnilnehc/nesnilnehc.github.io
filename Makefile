.PHONY: install dev build validate test test-music test-poetry test-browser

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

test-music: build
	node --test script/music-story.test.cjs

test-poetry: build
	node --test script/poetry-periods.test.cjs

test-browser:
	node --test script/*-browser.test.cjs
