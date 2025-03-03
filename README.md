# Authentication Service

This project implements an authentication service using a clean hexagonal architecture. It provides endpoints for user registration, login, token validation, and token refresh, ensuring secure access through JWT tokens.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Building the Project](#building-the-project)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Docker](#docker)
- [CI/CD](#cicd)
- [Code Quality](#code-quality)
- [License](#license)

## Features

- **User Registration & Login**: Create and authenticate users.
- **JWT Authentication**: Secure endpoints by generating and validating JWT tokens using [`JwtTokenService`](src/authentication/app/src/infrastructure/adapters/JwtTokenService.ts).
- **Token Validation & Refresh**: Validate tokens with [`ValidationUseCase`](src/authentication/app/src/application/use-cases/ValidationUseCase.ts) and refresh expired tokens via [`RefreshTokenUseCase`](src/authentication/app/src/application/use-cases/RefreshTokenUseCase.ts).
- **Hexagonal Architecture**: Separation of the Domain, Application, and Infrastructure layers to enhance maintainability and testability.
- **HTTP REST API**: Exposed APIs through the [`AuthAdapter`](src/authentication/app/src/infrastructure/adapters/AuthAdapter.ts).

## Architecture

The service follows a hexagonal architecture divided into three main layers:

- **Domain Layer**  
  Contains core business models and interfaces:
  - User model and validation payloads.
  - Ports for token service ([`TokenService`](src/authentication/app/src/domain/ports/TokenService.ts)), user repository, and use cases.

- **Application Layer**  
  Implements the business logic using use cases:
  - [`LoginUseCase`](src/authentication/app/src/application/use-cases/LoginUseCase.ts) for user authentication.
  - [`RegistrationUseCase`](src/authentication/app/src/application/use-cases/RegistrationUseCase.ts) for user registration.
  - [`ValidationUseCase`](src/authentication/app/src/application/use-cases/ValidationUseCase.ts) for token validation.
  - [`RefreshTokenUseCase`](src/authentication/app/src/application/use-cases/RefreshTokenUseCase.ts) for token refresh operations.

- **Infrastructure Layer**  
  Provides implementations and adapters:
  - **HTTP Adapter**: [`AuthAdapter`](src/authentication/app/src/infrastructure/adapters/AuthAdapter.ts) that exposes the REST API.
  - **Token Service**: [`JwtTokenService`](src/authentication/app/src/infrastructure/adapters/JwtTokenService.ts) implements token generation and verification.
  - **Persistence Adapter**: [`MongoUserRepository`](src/authentication/app/src/infrastructure/database/MongoUserRepository.ts) for MongoDB operations.
  - **Password Hasher**: [`BcryptPasswordHasher`](src/authentication/app/src/infrastructure/adapters/BCryptPasswordHasher.ts) for secure password storage.

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/CryptoMonitorASW-SPE/authentication.git
cd authentication
```
## Building the Project
This project uses Gradle and Node.js. To build the project, run the following commands:

Install npm dependencies for both the root and app directories:
```bash
./gradlew npmCiAll
```

Build the project:

```bash
./gradlew build
```

## Running the Application

After building, start the application with:

```bash
./gradlew start
```

The server runs on port 3000 by default and exposes the following endpoints:

- POST /register: Register a new user.
- POST /login: Authenticate a user.
- POST /refresh: Refresh JWT tokens.
- POST /logout: Logout the user.

## Testing

Unit and integration tests are implemented using Mocha, Chai, Sinon, TSArch and Supertest.

To execute the tests run:

```bash
cd app/
npm run test
```

Test reports are generated under the app/reports directory.

## Docker
A Dockerfile is included to build an image of the service. To build using Docker:

Build the Docker image:

```shell
docker build -t authentication .
```

## CI/CD

### Automatic Releases

Changes pushed to the main branch automatically trigger a release process that builds the project and creates a new release.

### CI/CD for Docker

Each release builds a Docker image that is pushed to GitHub Container Registry. The image is tagged with both `latest` and the release tag.

### Code Quality and Testing

For every pull request, the CI workflow:

-   Runs ESLint to check for code quality.
-   Executes the test suite to ensure all tests pass.

### Code Quality

ESLint and Prettier enforce a consistent code style. Lint the code by running:

```bash
cd app/
npm run eslint
```

### Commitlint & Husky
Commit messages are standardized using Commitlint. Husky ensures linting and tests run before commits.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

