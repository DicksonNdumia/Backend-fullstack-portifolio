 # Set the base image to create the image for the backend
FROM node:20-alpine

 #create a user with permissions to run the app
 # -S -> create the user to a group
 # -G -> add the user to a group
 # this is done to avoid running the app as root
 # if the app is run as root, any vulneravility in the app can be exploited to gain
 # access to the host system
 # It's a good practice to run the app as a non-root user
RUN addgroup app && adduser -S -G app app
# Set the user to run the app
USER app
# Set the working directory to /app
WORKDIR /app
# Copy package.json and package-lock.json to the working directory
# This is done before copying the rest of the files to take advantage of Docker's cache
# If the package.json and package-lock.json files haven't changed, Docker will used the
# cached dependencies
COPY package*.json ./

# sometimes the ownership of the files in the working directory is changed to root
# and thus the app can't access the files and throws an error -> EACCES: permission denied
# to avoid this, change the  ownership to the root user

USER root
# change the ownership of the /app directory to the app user
# chown -R <user>:<group> <directory>
# chown command changes the user and/or group ownership of for given file.
RUN chown -R app:app .
# change the user back to the app user
USER app

#install the dependencies
RUN npm install

# copy the rest of the files to the working directory
COPY . .

#export poer 3000 to tell Docker that the container listens on  the specified network port
# at runtime
EXPOSE 5000
