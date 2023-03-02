## Nest JS Basic Project SetUp

You can find a collection of API examples on [Postman](https://documenter.getpostman.com/view/19273253/2s935mqPpz).

#### Prerequisites:

Before you begin, make sure you have the following installed on your system:

1. Postgres 14.x
2. Node >=14.x <=16.x
3. Yarn >=1.20.x <=1.22.x


#### To Pre-run
1. Create a .env file inside the root folder and populate the environment variables the app depends on. Eg: 
`
  PORT=8080
  DB_HOST=localhost
  DB_PORT=5432
  DB_USERNAME=db-user-name
  DB_PASSWORD=db-user-password
  DB_MIN_POOLSIZE=0
  DB_MAX_POOLSIZE=200
  DB_NAME=db-name
  JWTSECRET_KEY=mysecret_key
`
PORT => The port the app will listen to for requests
DB_HOST => The database host
DB_PORT => The port which the databse is listening to
DB_USERNAME => The database user that is authorized to access the 'DB_NAME'
DB_PASSWORD => The database user's (DB_USERNAME) password
DB_MIN_POOLSIZE => The minimum active pool (both idle and in use)
DB_MAX_POOLSIZE => The maximum number of pools that can be created
DB_NAME => The database name
JWT_SECRET_KEY => The JWT secret key for encrypting users details for authorization purposes

2. `yarn install` (To install dependencies)

#### Run (development mode)
1. `yarn mr-u` (To run migrations for setting up db)
2. `yarn start:dev` (To run in development mode)


#### Run (production mode)
1. `yarn mr-u` (To run migrations for setting up db)
2. `yarn build` (To compile the Typescript code to JavaScript)
3. `yarn start` (To run app)

Gracias :kiss: