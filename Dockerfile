######################################
# Dockerfile to build web app mashup #
######################################
# Set base image to Ubuntu
FROM ubuntu:18.04
MAINTAINER Andrew Mather

# Install basic applications
RUN apt-get update
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get -y install nodejs

# Copy the application folder inside the container
ADD /easymoney /easymoney

# Expose ports
EXPOSE 3000

# Set default CMD directory
WORKDIR /easymoney

# Setup web server
RUN npm install

# Start web server when container run
CMD npm start

