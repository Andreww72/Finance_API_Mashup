######################################
# Dockerfile to build web app mashup #
######################################
# Set base image to Ubuntu
FROM ubuntu
MAINTAINER Andrew Mather

# Install basic applications
RUN apt-get -y update && apt-get install -y \
	git \
	curl

# Copy the application folder inside the container
ADD /quickstocks /quickstocks

# Expose ports
EXPOSE 80

# Set default CMD directory
WORKDIR /quickstocks

# Setup web server
RUN npm install
RUN npm start
