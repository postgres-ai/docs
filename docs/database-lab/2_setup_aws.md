## AWS Setup

Consider using [AWS Spot Instances](https://aws.amazon.com/en/ec2/spot/) if you want to spend up to 90% less. However, keep in mind that such instances may be deleted at arbitrary moment, so avoid using them if you need a better uptime for your Database Lab service or use multiple Spot Instances of different EC2 families to and prepare for using "switch and retry" philosophy in all your manual and automated use cases of Database Lab.

Below, we describe the process of preparing an EC2 instance with database located on an additional EBS volume (thin clones will also be stored there). Another option would be using a local NVMe SSD disk (available on such EC2 families as `i3` or `i3en`; the 3rd-party resource [https://ec2instances.info/](https://ec2instances.info/) is a 3rd-party resource useful for comparison of various instance types). But again, this is also a not reliable way because such disks [are ephemeral](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/InstanceStorage.html). However, if your use cases are ready to use "switch and retry" approach, using Spot Instances with local NVMe SSDs may be very reasonable due to their excellent speed and price and the fact that Database Lab is a non-production environment.

### Create an EC2 instance with additional EBS volume

Go to EC2 service section in AWS console, proceed to Instances, and press Launch Instance. Choose Ubuntu 18.04 LTS.

![Screen_Shot_2020-01-07_at_15.31.17](/uploads/1cbb1e226c8de8f492d42ff1ea0b75aa/Screen_Shot_2020-01-07_at_15.31.17.png)

At the next step, choose the instance type you need. The best option is to choose the same type that you are using on production (if your production is on AWS; if not, a type which is as close to your production machine as possible in terms of CPU, RAM, network). However, you may choose a different type of instance based on your usage. See Capacity Planning (!!! TODO link) section for more details.

Next, you need to configure the instance: network, public IP if needed, and so on. Add public IP if you are going to access the instance from outside. Keep in mind, that in this case, Postgres clones will be accessable from public. You will need to enforce using strong passwords in this case, to secure the access to your data. Database Lab automatically disables all database roles except the only one which is to be used by users (specified at clone request time). Refer to Security section (!!! TODO link) for more details.

On the next step, press `Add New Volume` to add an EBS volume and specify the size of the disk you will need. The rule of thumb here is using the same size of the disk as you are using on production now (Capacity Planning (!!! TODO link)).

![Screen_Shot_2020-01-07_at_22.45.03](/uploads/c0de3b866f68470e13bb917151e318ef/Screen_Shot_2020-01-07_at_22.45.03.png)

The next step is Tags, you may skip unless you need them. The next step is important, Security Group configuration:

![Screen_Shot_2020-01-07_at_15.44.32](/uploads/25415a1a7a56d39fbceda7b577c46346/Screen_Shot_2020-01-07_at_15.44.32.png)

Add PostgreSQL and HTTPS. SSH is also needed because we will need to connect to the instance using SSH to install the Database Lab. Additionally, you may consider adding HTTP instead of HTTPS if you are planning to use HTTP for Database Lab API, but this is not recommended. As for IP addresses, restrict them as much as possible (on the picture above, we chose `Anywhere` in the `Source` column for demonstration purposes).

Review your request and then upload your public SSH key or choose an existing one if any:

![Screen_Shot_2020-01-07_at_15.49.47](/uploads/c69ceae04006adcb0e427975171ee1b6/Screen_Shot_2020-01-07_at_15.49.47.png)

Finally, launch your instance. After a minute or two, it should be presented in the Instances section with `running` status and all checks passed:

![Screen_Shot_2020-01-07_at_15.56.23](/uploads/24ce3ee6b767611920eb891c87a2c491/Screen_Shot_2020-01-07_at_15.56.23.png)

Get its IP address or hostname and connect using your private SSH key:

```bash
ssh -i /path/to/private-key ubuntu@ip_or_hostname
```

Get the name of the EBS volume using `lsblk` or `sudo fdisk -l`. For example:
```bash
ubuntu@ip-172-31-80-32:~$ lsblk
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
loop0     7:0    0   89M  1 loop /snap/core/7713
loop1     7:1    0   18M  1 loop /snap/amazon-ssm-agent/1480
xvda    202:0    0    8G  0 disk
└─xvda1 202:1    0    8G  0 part /
xvdb    202:16   0  150G  0 disk
```
– here, `xvdb` is the name that we are going to use as Database Lab storage. Remember the path to this device in `DBLAB_DISK` variable:

```bash
export DBLAB_DISK="/dev/xvdb"
```

Now you are ready to install and configure the Database Lab software.
