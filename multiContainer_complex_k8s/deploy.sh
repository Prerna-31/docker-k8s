## Build the images, tag them and push them to Docker Hub. Ensure to have a unique tag for each image and for each push
## to ensure that we can apply the correct changes to the production/deployment hence attach the SHA to the tag. It helps
## to debug the issue in the running k8 cluster in future. But why latest? To ensure that the latest image is truely the
## latest image in case we need to re-clone or re-build the cluster at some-point of time and we don't need to track the
## SHA everytime because all the deployments scripts implicitly refers to the latest image even if we don't specify the tag.
docker build -t stephengrider/multi-client:latest -t stephengrider/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t stephengrider/multi-server:latest -t stephengrider/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t stephengrider/multi-worker:latest -t stephengrider/multi-worker:$SHA -f ./worker/Dcokerfile ./worker

docker push stephengrider/multi-client:latest
docker push stephengrider/multi-server:latest
docker push stephengrider/multi-worker:latest
docker push stephengrider/multi-client:$SHA
docker push stephengrider/multi-server:$SHA
docker push stephengrider/multi-worker:$SHA

kubectl apply -f k8s

## imperative commands to set latest images on each deployment.
kubectl set image deployments/server-deployment server=stephengrider/multi-server:$SHA
kubectl set image deployments/client-deployment client=stephengrider/multi-client:$SHA
kubectl set image deployments/worker-deployment worker=stephengrider/multi-worker:$SHA