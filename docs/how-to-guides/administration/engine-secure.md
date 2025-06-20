---
title: Secure DBLab Engine
sidebar_label: Secure DBLab Engine
---

To make your work with DBLab Engine UI / API / CLI and clones secure, install and configure [Envoy proxy](https://www.envoyproxy.io) with a SSL certificate.

:::note
Before you begin, you will need your Organization key and Project name provided by the Postgres AI platform. Obtain these by registering on the [platform](http://console.postgres.ai). Detailed instructions are available [here](https://postgres.ai/docs/how-to-guides/administration/install-dle-from-postgres-ai).
:::

## Configuring a secure DBLab engine

### 1. DNS configuration
Update the DNS `A` record for your public domain to resolve to the public IP address of the DBLab Engine server. Note that DNS changes may take some time to propagate.

### 2. Proxy installation
Run the following command to install the Envoy proxy and obtain a Let's Encrypt SSL certificate. Replace the placeholders with your actual server details:

 ```bash
docker run --rm -it \
  -v $HOME/.ssh:/root/.ssh:ro \
  -e ANSIBLE_SSH_ARGS="-F none" \
  postgresai/dle-se-ansible:v1.4 \
    ansible-playbook software.yml --tags proxy --extra-vars \
      "dblab_host='user@server-ip-address' \
       proxy_install='true' \
       certbot_domain='dblab.yourdomain.com' \
       certbot_admin_email='your-email@yourdomain.com' \
       platform_org_key='YOUR_ORG_KEY' \
       platform_project_name='YOUR_PROJECT_NAME'"
 ```

:::note
Replace `user@server-ip-address` with the actual username and IP address for your server, `dblab.yourdomain.com` with your domain.
:::

## Accessing the DBLab Engine and clones

### DBLab Engine UI/API/CLI
Connect securely over HTTPS on port 443, such as `https://dblab.yourdomain.com`.

### DBLab database clones
Access database clones by appending `+3000` to the original connection port. For example, for a clone originally on port `6000`, you would use port `9000`. This mapping ensures that connections to clones are routed correctly through the proxy:

```bash
PGPASSWORD=secret_password psql \
  "host=dblab.yourdomain.com port=9000 user=dblab_user dbname=test sslmode=require"
```

Adjust the port numbers accordingly for other clones, following the pattern `original_port+3000` (e.g., `6001->9001`, `6002->9002`, etc.).
