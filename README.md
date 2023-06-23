# To Dos API
A description should go here

## Configuration

## Build and Run
This repository leverages Docker to streamline development. Use the following
command in this root directory to build and run the solution:

`docker-compose up`

Once running, you can access the solution at
[http://localhost:8080](http://localhost:8080)

### Swagger
To streamline development, a SwaggerUI instance is configured that automatically
references the [OpenAPI specification](./doc/openapi.yaml) of the API. Once
running, you can access this at [http://localhost:50000](http://localhost:50000)

## Debugging
Port 9229 is setup as the solution's debug port and exposed on the Docker host
for development purposes. With the solution running, attach your preferred
debugger to this port on the host.

If you need to debug initialization code (e.g. server startup) that's outside of
the main loop, the command in [./docker-compose.yml](docker-compose.yml) needs
to be changed to the following:

`npm run start-debug`

With this configuration, bringing up the solution will wait for a debugger to
attach before proceeded.

## Testing
This solution uses the Jest framework for unit and integration tests. With the
solution running, the test suite can be executed with the following commands:

* Full Test Suite
  `docker-compose exec app npm run test`
* Unit Test Suite
  `docker-compose exec app npm run test:unit`
* Integration Test Suite
  `docker-compose exec app npm run test:integration`
* User Defined Test Pattern
  `docker-compose exec app npm run test -- <userpattern>`
  * Example for just the index.js unit test:
    `docker-compose exec app npm run test -- unit/index`

### Test Debugging
Port 9230 is setup as the solution's testing debug port and exposed on the
Docker host for development purposes. To debug tests, execute the tests with the
following command:

`docker-compose exec app npm run test-debug`

The container's test execution will then wait for your host's debugger to
attach.