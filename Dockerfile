FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
RUN npm install --production

# Set environment variables
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080
CMD ["node", "dist/index.js"]
