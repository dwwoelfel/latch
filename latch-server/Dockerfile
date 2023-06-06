FROM node:20 as builder

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .
COPY .yarn .
COPY .yarnrc.yml .

RUN yarn set version berry

RUN yarn install

COPY schema.graphql .
COPY vite.config.js .
COPY tsconfig.json .
COPY src src
COPY index.html .
COPY relay.config.json .

RUN yarn build

FROM node:20 as deps-builder

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .
COPY .yarn .
COPY .yarnrc.yml .

RUN yarn set version berry
RUN yarn plugin import workspace-tools

RUN yarn workspaces focus --production

FROM node:20

WORKDIR /usr/src/app

ENV NODE_ENV production
COPY --from=builder /usr/src/app/build build
COPY --from=deps-builder /usr/src/app/node_modules node_modules
COPY package.json .
COPY schema.graphql .

CMD [ "node", "build" ]
