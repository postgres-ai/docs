---
title: Secure Database Lab Engine
---

[↵ Back to Administration guides](/docs/guides/administration)

To make your work with Database Lab API secure, install and configure NGINX with a self-signed SSL certicate.

Define `${IP_OR_HOSTNAME}` of your instance, using either hostname or IP address:

```bash
export IP_OR_HOSTNAME="123.45.67.89"
```


Install NGINX:

```bash
sudo apt-get install -y nginx openssl
```

Define `${YOUR_OWN_PASS}` environment variable for certificate generation.

Generate SSL certificate request:

```bash
mkdir -p ~/ssl
cd ~/ssl

# TODO: Use https://github.com/suyashkumar/ssl-proxy instead.
# To generate certificates, use, for instance, Let's Encrypt
# (e.g. https://zerossl.com/free-ssl/#crt).
# Here we are generating a self-signed certificate.

openssl genrsa -des3 -passout pass:${YOUR_OWN_PASS} -out server.pass.key 2048
openssl rsa -passin pass:${YOUR_OWN_PASS} -in server.pass.key -out server.key
rm server.pass.key

# Will ask a bunch of questions which should be filled with answers.
openssl req -new -key server.key -out server.csr
```

Finish SSL certificate generation and configure NGINX (do not forget to set `$IP_OR_HOSTNAME` as described above!). Website https://nginxconfig.io/ may be also helpful when you prepare NGINX config file. Here is a basic example:

```bash
openssl x509 -req -sha256 -days 365 -in server.csr -signkey server.key \
  -out server.crt

sudo mkdir -p /etc/nginx/ssl
sudo cp server.crt /etc/nginx/ssl
sudo cp server.key /etc/nginx/ssl

cat <<CONFIG > default
server {
  listen 443 ssl;

  ssl on;
  ssl_certificate /etc/nginx/ssl/server.crt; 
  ssl_certificate_key /etc/nginx/ssl/server.key;

  server_name ${IP_OR_HOSTNAME};
  access_log /var/log/nginx/database_lab.access.log;
  error_log /var/log/nginx/database_lab.error.log;
  location / {
    proxy_set_header   X-Forwarded-For \$remote_addr;
    proxy_set_header   Host \$http_host;
    proxy_pass         "http://127.0.0.1:2345";
  }
}
CONFIG

sudo cp default /etc/nginx/sites-available/default

sudo systemctl restart nginx

# See also (though here it was not used, it might be helpful):
# https://nginxconfig.io/
```

Now we can check the status using HTTPS connection (here we use `--insecure` flag
to allow working with the self-signed certificate we have generated above):
```bash
curl \
  --insecure \
  --include \
  --request GET \
  --header 'Verification-Token: secret_token' \
  https://${IP_OR_HOSTNAME}/status
```

[↵ Back to Administration guides](/docs/guides/administration)
