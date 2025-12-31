# Running the MCP Server Locally

You can run the MCP server locally (in VS Code, SAP Business Application Studio, or any environment) using a `default-env.json` file for service credentials. Optionally, you can use a `.env` file to override the destination name.

## Configuration Steps

1. Copy `example-default-env.json` to `default-env.json` in your project root.
2. Fill in the placeholders with the credentials for your:
   - **Destination service instance**
   - **Connectivity service instance**
   - **XSUAA service instance** (currently not used, but planned for future authentication support)

## Optional: Override Destination Name with .env

If you want to use a different destination than `SAP_SYSTEM`, create a `.env` file in your project root and set:

```env
SAP_DESTINATION_NAME=MY_DESTINATION
```

You can also set any service discovery environment variables described in the main documentation.

## Preparing Connectivity service to run locally

If you don't want to configure keys manually without the `default-env.json` file, do a first deploy to BTP.

After deployment, copy the environment variables from BTP to your `default-env.json` file.

### Enable SSH on your application

Run the following commands **one time** to enable SSH in your app:

```bash
cf ssh-enabled sap-mcp-server-dev
cf enable-ssh sap-mcp-server-dev
cf restart sap-mcp-server-dev
```

### Create SSH tunnel

Create a tunnel between BTP and your local machine:

```bash
cf ssh -L 20003:connectivityproxy.internal.cf.us10-001.hana.ondemand.com:20003 sap-mcp-server-dev
```

> **Note:** Don't forget to change the connectivity configuration in `default-env.json`:
> ```json
> "onpremise_proxy_host": "127.0.0.1"
> ```


## Running the Server

After configuration, start the server with:

```bash
npm run start:http
```


## ⚙️ Environment Variable: Disable ReadEntity Tool Registration

To disable registration of the ReadEntity tool for all entities in all services, set the following in your `.env` file:

```env
DISABLE_READ_ENTITY_TOOL=true
```
This will prevent registration of the ReadEntity tool for all entities and services.

- The XSUAA configuration is present for future authentication support, but is not currently used.
- You can combine these environment variables with any service discovery configuration described in `SERVICE_DISCOVERY_CONFIG.md`.
- For more advanced configuration, see the main documentation.
