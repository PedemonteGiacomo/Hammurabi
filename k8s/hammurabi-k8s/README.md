# Setting Up a Local Docker Registry and Upload an image

## 1. Run a Local Docker Registry

You can quickly spin up a local Docker registry container using the official registry image. Open your terminal and run:

```bash
docker run -d -p 5000:5000 --restart=always --name registry registry:2
```

This command does the following:
* `-d`: Runs the container in detached mode
* `-p 5000:5000`: Exposes the registry on port 5000
* `--restart=always`: Ensures the container restarts automatically if it stops
* `--name registry`: Names the container as "registry"
* `registry:2`: Uses version 2 of the official Docker registry image

You can verify that your local registry is running by visiting `http://localhost:5000/v2/` in your browser. It should return an empty JSON response (`{}`) if everything is working.

## 2. Tag Your Built Image for the Local Registry

Assuming your built image is named `hammurabi-ui-prod:latest`, tag it so that it points to your local registry:

```bash
docker tag hammurabi-ui-prod:latest localhost:5000/hammurabi-ui-prod:latest
```

This command creates a new tag for your image so it's recognized as being hosted in your local registry.

## 3. Push the Image to Your Local Registry

Now, push the tagged image to the registry:

```bash
docker push localhost:5000/hammurabi-ui-prod:latest
```

You should see the layers being pushed. Once completed, your image will be available in your local registry.
