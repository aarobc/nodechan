FROM node
RUN npm install -g node-inspector
RUN npm install -g vue-cli
RUN useradd -p ac ac
RUN mkdir -p /home/ac
RUN chown -R ac:ac /home/ac
# EXPOSE 8080 5858
