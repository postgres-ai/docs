import React from 'react'

import styles from './styles.module.css'

const MONTHLY_HOURS = 24 * 30

const Table = () => {
  const tablePricing = [
    {
      instance: 'm5.large',
      memory: '8 GiB RAM',
      cpu: '2 vCPUs',
      dle: '0.086',
      ec2: '0.096',
      total: '0.182',
    },
    {
      instance: 'm5.xlarge',
      memory: '16 GiB RAM',
      cpu: '4 vCPUs',
      dle: '0.172',
      ec2: '0.192',
      total: '0.364',
    },
    {
      instance: 'm5.2xlarge',
      memory: '32 GiB RAM',
      cpu: '8 vCPUs',
      dle: '0.345',
      ec2: '0.384',
      total: '0.729',
    },
    {
      instance: 'm5.4xlarge',
      memory: '64 GiB RAM',
      cpu: '16 vCPUs',
      dle: '0.691',
      ec2: '0.768',
      total: '1.459',
    },
    {
      instance: 'm5.8xlarge',
      memory: '128 GiB RAM',
      cpu: '32 vCPUs',
      dle: '1.382',
      ec2: '1.536',
      total: '2.918',
    },
    {
      instance: 'm5.12xlarge',
      memory: '192 GiB RAM',
      cpu: '48 vCPUs',
      dle: '2.073',
      ec2: '2.304',
      total: '4.377',
    },
    {
      instance: 'm5.16xlarge',
      memory: '256 GiB RAM',
      cpu: '64 vCPUs',
      dle: '2.764',
      ec2: '3.072',
      total: '5.836',
    },
    {
      instance: 'm5.24xlarge',
      memory: '384 GiB RAM',
      cpu: '96 vCPUs',
      dle: '4.147',
      ec2: '4.608',
      total: '8.755',
    },
    {
      instance: 'r5.large',
      memory: '16 GiB RAM',
      cpu: '2 vCPUs',
      dle: '0.113',
      ec2: '0.126',
      total: '0.239',
    },
    {
      instance: 'r5.xlarge',
      memory: '32 GiB RAM',
      cpu: '4 vCPUs',
      dle: '0.226',
      ec2: '0.252',
      total: '0.478',
    },
    {
      instance: 'r5.2xlarge',
      memory: '64 GiB RAM',
      cpu: '8 vCPUs',
      dle: '0.453',
      ec2: '0.504',
      total: '0.957',
    },
    {
      instance: 'r5.4xlarge',
      memory: '128 GiB RAM',
      cpu: '16 vCPUs',
      dle: '0.907',
      ec2: '1.008',
      total: '1.915',
    },
    {
      instance: 'r5.8xlarge',
      memory: '256 GiB RAM',
      cpu: '32 vCPUs',
      dle: '1.814',
      ec2: '2.016',
      total: '3.83',
    },
    {
      instance: 'r5.12xlarge',
      memory: '384 GiB RAM',
      cpu: '48 vCPUs',
      dle: '2.721',
      ec2: '3.024',
      total: '5.745',
    },
    {
      instance: 'r5.16xlarge',
      memory: '512 GiB RAM',
      cpu: '64 vCPUs',
      dle: '3.628',
      ec2: '4.032',
      total: '7.66',
    },
    {
      instance: 'r5.24xlarge',
      memory: '768 GiB RAM',
      cpu: '96 vCPUs',
      dle: '5.443',
      ec2: '6.048',
      total: '11.491',
    },
  ]

  return (
    <div className={styles.tableContainer}>
      <h2>DLE pricing for AWS Marketplace</h2>
      <table id="aws-pricing-details" className={styles.table}>
        <tr className={styles.tableHeader}>
          <th>EC2 type and size</th>
          <th>DLE, per hour</th>
          <th>EC2, per hour</th>
          <th>Total, per hour</th>
          <th>Total per 30d</th>
        </tr>
        {tablePricing.map((item, index) => {
          return (
            <tr key={index}>
              <td>
                <div className={styles.tableInstance}>
                  <p>
                    <strong>{item.instance}</strong>
                  </p>
                  <p className={styles.hardwareInfo}>
                    {item.cpu}, {item.memory}
                  </p>
                </div>
              </td>
              <td>${item.dle}</td>
              <td>${item.ec2}</td>
              <td>${item.total}</td>
              <td>${(Number(item.total) * MONTHLY_HOURS).toFixed(2)}</td>
            </tr>
          )
        })}
      </table>
      <a
        className={`btn btn1 ${styles.tableButton}`}
        target="blank"
        href="https://aws.amazon.com/marketplace/pp/prodview-wlmm2satykuec"
      >
        Set up in 3 minutes
      </a>
      <div className={styles.notes}>
        <h2>Additional notes:</h2>
        <ul>
          <li>
            The prices are probided for the AWS region us-east-1. You can check
            the exact price when making an order in AWS Marketplace.{' '}
          </li>
          <li>
            EBS volume costs are not included. EBS volume used depends on the
            size of the database (defined during setup); it is billed according
            to{' '}
            <a href="https://aws.amazon.com/ebs/pricing/" target="blank">
              AWS pricing.
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Table
