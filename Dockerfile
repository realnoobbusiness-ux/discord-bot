# Use Node 18
FROM node:18

# Install libatomic1
RUN apt-get update && apt-get install -y libatomic1

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the code
COPY . .

# Start the bot
CMD ["node", "bot.js"]
