# Simple dump (with master password) in case of default settings of RDS

1. Config
> Only one database can be exported
- Use logical dump example (suitable for any database), less secure because of password in the config
- Update connection options (host, username, password), parallel jobs

2. Run


Launch PostgreSQL instance with IAM auth enabled


Create IAM auth user with rds_iam ROLE:
CREATE USER test_user WITH LOGIN; 
GRANT rds_iam to test_user;
GRANT rds_superuser to test_user;


Configure a logical-dump job.


global:
  engine: postgres
  dataDir: /var/lib/dblab/data

retrieval:
  stages:
    - initialize
  spec:
    initialize:
      jobs:
        - name: logical-dump
          options:
            dumpLocation: /tmp/dump/db.dump
            dockerImage: "postgresai/retrieval:12"
            source:
              type: rds
              connection:
                dbname: test
              rds:
                iamPolicyName: rds-dblab-retrieval
                awsRegion: us-east-2
                username: test_user
                dbInstanceIdentifier: database-1
                sslRootCert: "/tmp/rds-combined-ca-bundle.pem"


wget https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem -P ~/.dblab/
Run a Database Lab instance providing AWS environment variables:

sudo docker run \
--name dblab_server \
--label dblab_control \
--privileged \
--publish 2345:2345 \
--volume /var/run/docker.sock:/var/run/docker.sock \
--volume /var/lib/dblab:/var/lib/dblab/:rshared \
--volume ~/.dblab/configs/config.yml:/home/dblab/configs/config.yml \
--volume /tmp/dump/:/tmp/dump \
--volume ~/.dblab/rds-combined-ca-bundle.pem:/tmp/rds-combined-ca-bundle.pem \
--env VERIFICATION_TOKEN=secret_token \
--env AWS_ACCESS_KEY_ID={AWS_KEY} \
--env AWS_SECRET_ACCESS_KEY={AWS_SECRET} \
--rm \
registry.gitlab.com/postgres-ai/database-lab/dblab-server:71-rds-dump
