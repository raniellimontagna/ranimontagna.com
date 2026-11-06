FROM node:22-bookworm-slim
ENV NEXT_TELEMETRY_DISABLED=1 CI=1
WORKDIR /app
RUN npm install -g pnpm@10.28.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN NODE_OPTIONS=--max-old-space-size=4096 pnpm build
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["pnpm", "start"]
