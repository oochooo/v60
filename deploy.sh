docker build -f gh-pages.Dockerfile -t v60-build . && \
docker create --name v60-temp v60-build && \
docker cp v60-temp:/app/dist ./dist && \
docker rm v60-temp

# push manually