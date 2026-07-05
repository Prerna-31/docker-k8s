# This block will create a build directory under /app which will be used by nginx
# No volume sharing is required in prod because we don't change our code on the fly in prod.
# FROM baseImage:Tag AS stage. The name of this build stage
FROM node:16-alpine AS builder
WORKDIR '/app'
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

# This block uses /app/build and start nginx
FROM nginx
# This instruction does not do anything in dev/local machine but it is very important to add for EBS
EXPOSE 80
COPY --from=builder /app/build /usr/share/nginx/html
# the default command of nginx is gonna start nginx for us. We don't need to mention CMD