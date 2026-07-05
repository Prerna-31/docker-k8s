# Specify a base image
FROM node:14-alpine

# Mention the working directory for the docker to use instead of using root directory.
# If this folder doesn't exist in the container, it will create for us.
WORKDIR /usr/app

# Copy current directory to the container
# and Install some dependencies.
COPY ./package.json ./
RUN npm install
COPY ./ ./

#Default command
CMD ["npm",  "start"]