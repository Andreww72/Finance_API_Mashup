######################################
# Dockerfile to build web app mashup #
######################################
# Set base image to Ubuntu
FROM ubuntu
MAINTAINER Andrew Mather

# Install basic applications
RUN apt-get update
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_12.x  | bash -
RUN apt-get -y install nodejs

# Copy the application folder inside the container
ADD /quickstocks /quickstocks

# Expose ports
EXPOSE 80

# Set default CMD directory
WORKDIR /quickstocks

# Setup web server
RUN npm install

# Start web server when container run
CMD npm start

