FROM node:15

# Create app directory, this is in our container/in our image
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./


ARG NODE_ENV
# if args is development then npm install 
# if args is production then run --only=production. 
#  this means doen't install dev dependenceies
RUN if [ "$NODE_ENV" = "development" ]; \
    then npm install; \
    else npm install --only=production; \
    fi

# Bundle app source
COPY . ./

ENV PORT 3000
EXPOSE $PORT

# RUN npm run build

CMD [ "node", "dist/main" ]