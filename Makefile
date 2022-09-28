develop:
	npx webpack serve

install:
	npm ci

build:
	rm -rf dist
	NODE_ENV=development npx webpack

test:
	npm test

lint:
	npx eslint .

.PHONY: test