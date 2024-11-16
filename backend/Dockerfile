# Step 1: Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy the package.json and package-lock.json (or npm-shrinkwrap.json)
COPY package*.json ./

# Step 4: Install all dependencies (including dev dependencies)
RUN npm install

# Step 5: Copy the rest of the application code into the container
COPY . .

CMD ["node", "index.js"]

# docker run -d     -p 3000:3000     --restart unless-stopped     --name vultr-backend     -v /c/yogendra/vultr/backend:/app     -v /app/node_mod
# ules     yogendraapawar/vultr-backend:latest

