# DebugBear RUM Proxy Google Cloud Function

This repository provides an easy way to deploy a Google Cloud function that can proxy the DebugBear RUM snippet and RUM page view data. This way, the IP address of your website visitors is never shared with DebugBear.

While the code here is ready to deploy, you may wish to customize it and use it as a starting point for your own proxy logic.

## What does the proxy do?

The proxy:

- Serves the JavaScript analytics snippet
- Receives page view analytics and forwards them to the DebugBear server

## Deployment and environment variables

To deploy this function you first need to identify two values for your application:

- `RUM_SNIPPET_ID`: The ID of your RUM script, you can find it as part of your script URL in your RUM embed code: `cdn.debugbear.com/[RUM_SNIPPET_ID].js`
- `RUM_TOKEN`: You can find this value on the DebugBear website under "RUM" => "Configuration" => "Proxy Setup" => "RUM Token"

You can then deploy the cloud function like this:

```
RUM_SNIPPET_ID=abcd RUM_TOKEN=efgh npm run deploy
```

## What to do after deployment

After deploying the `debugbearrumproxy` cloud function you can open it in your Google Cloud Console. Here you'll find the function URL.

To proceed with your RUM integration, you can either use the URL directly or load the RUM script from your own domain using a load balancer.

To complete the setup you need to:

1. Open the RUM proxy settings in your DebugBear account and set the "Data Endpoint" to the proxy URL
2. Embed the script on your website, for example using `<script async src={{PROXY_URL}}></script>`

## Service account and other cloud function options

This cloud function requires no access to any internal resources on your cloud environment. We recommend deploying it with a restricted service account.

You can pass a service account and other options by editing the `deploy` command in package.json or by passing additional options after a double hyphen:

```
RUM_SNIPPET_ID=abcd RUM_TOKEN=efgh npm run deploy -- --service-account=serviceaccount@project.iam.gserviceaccount.com
```

## Identifying the visitor country based on their IP address

Since DebugBear does not have access to the visitor's IP address, you need to pass the `x-rum-country` header when reporting RUM data.

This cloud function sets the header using two approaches:

1. Where available, an `x-rum-country` request header is forwarded to DebugBear
2. Otherwise, the `ip3country` library is used to identify the visitor's country

We recommend providing an `x-rum-country` header when the cloud function is accessed. You can do that by [setting up a load balancer and configuring custom headres](https://cloud.google.com/load-balancing/docs/https/custom-headers), setting `x-rum-country` to `{client_region}`.

Alternatively, you can also edit this cloud function code to use an external service or library to identify the visitor's country.
