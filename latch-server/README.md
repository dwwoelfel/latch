# Latch server

Latch server provides the UI for managing feature flags stored in Google Storage.


https://github.com/dwwoelfel/latch/assets/476818/baa22837-15a6-4522-915d-c28719d76d78


## Setup

### Create a bucket on google cloud with versioning enabled:

```sh
gcloud storage buckets create gs://YOUR_BUCKET_NAME --project "YOUR_GOOGLE_CLOUD_PROJECT_ID" --public-access-prevention

gcloud storage buckets update gs://YOUR_BUCKET_NAME --versioning
```

### Create a PubSub subscription to changes on the bucket

```
gcloud storage buckets notifications create gs://YOUR_BUCKET_NAME --topic=YOUR_TOPIC_NAME --event-types=OBJECT_FINALIZE
```

### Create an OAuth client with storage and pub/sub scopes

First create an OAuth consent screen from [https://console.cloud.google.com/apis/credentials/consent](https://console.cloud.google.com/apis/credentials/consent).

I recommend creating an `Internal` User Type or else users will have to click through a scary exception page when they log in.

When you get to scopes, add the following two scopes:

```
https://www.googleapis.com/auth/devstorage.read_write
```

```
https://www.googleapis.com/auth/pubsub
```

Create a new OAuth client from [https://console.cloud.google.com/apis/credentials/oauthclient](https://console.cloud.google.com/apis/credentials/oauthclient).

Application Type should be `Web Application`.

Fill in `Authorized redirect URIs` with the URL: `https://DOMAIN_YOU_WILL_DEPLOY_LATCH_TO/oauth/callback`. You can fill this in later if don't know the domain yet.

Keep track of the clientId and clientSecret, you will need those in a minute.

### Generate an encryption key

This will be used to encrypt cookies used to store the user's auth tokens

```
dd if=/dev/urandom bs=32 count=1 2>/dev/null | xxd -p -c 32
```

OR

```
openssl rand -hex 32
```

### Deploy the server

You'll need the following environment variables:

```
BUCKET_NAME=YOUR_BUCKET_NAME
TOPIC_NAME=YOUR_TOPIC_NAME
PROJECT_ID=YOUR_GOOGLE_CLOUD_PROJECT_ID
CLIENT_ID=YOUR_OAUTH_CLIENT_ID
CLIENT_SECRET=YOUR_OAUTH_CLIENT_SECRET
ENCRYPTION_KEY=YOUR_ENCRYPTION_KEY
```

There is a docker image available on Docker Hub at `docker.io/dwwoelfel/latch-server`.

#### Deploying to Cloud run

You can deploy to cloud run from [https://console.cloud.google.com/run/create](https://console.cloud.google.com/run/create)

Enter `docker.io/dwwoelfel/latch-server` as the Container image URL.

Check "Allow unauthenticated invocations".

Add your environment variables under the "Container, Networking, Security" section. You should use the "Secrets" functionality to add the client secret and encryption key. Make sure to mount them as environment variables.
