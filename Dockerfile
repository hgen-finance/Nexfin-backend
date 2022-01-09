FROM node:14
WORKDIR /app
RUN apt update
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN apt-get install libudev-dev -y
RUN cargo install spl-token-cli
RUN sh -c "$(curl -sSfL https://release.solana.com/v1.8.11/install)"
ENV PATH="/root/.local/share/solana/install/active_release/bin:$PATH"
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install -g nodemon
RUN npm install
COPY . .
RUN node init.js
COPY . .
CMD ["npm", "start"]
