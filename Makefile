all: test

test:
	mocha --recursive --reporter spec --bail --check-leaks
test-travis:
	istanbul cover ./node_modules/mocha/bin/_mocha --report lcovonly -- -R spec
	cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js

.PHONY: test test-travis
