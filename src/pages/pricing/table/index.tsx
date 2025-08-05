import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import React, { useEffect, useState } from 'react'

import styles from './styles.module.css'

const MONTHLY_HOURS = 730

const Table = () => {
  const { siteConfig } = useDocusaurusContext()
  const { customFields } = siteConfig
  const { apiUrlPrefix } = customFields
  const [isLoading, setIsLoading] = useState(true)
  const [tableData, setTableData] = useState([])

  useEffect(() => {
    fetch(
      `${apiUrlPrefix}/cloud_instances?cloud_provider=eq.gcp&only_in_regions&only_in_regions=ov.%7Ball,northamerica-northeast1%7D&order=vcpus.asc,ram_gib.asc`,
    )
      .then((response) => response.json())
      .then((data) => {
        setTableData(data)
        setIsLoading(false)
      })
  }, [])

  return (
    <div className={styles.tableContainer} id="aws-pricing-details">
      <h2>DBLab SE pricing</h2>
      <p className={styles.tableNote}>
        DBLab SE can be installed on any cloud or on-premises environment.
      </p>
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
        </div>
      ) : (
        <table className={styles.table}>
          <tr className={styles.tableHeader}>
            <th>Size</th>
            <th>vCPUs</th>
            <th>RAM, GiB</th>
            <th>Per hour</th>
            <th>Per month ({`${MONTHLY_HOURS}h`})</th>
          </tr>
          {tableData.map((item, index) => (
            <tr key={index}>
              <td>{item.api_name}</td>
              <td>{item.vcpus}</td>
              <td>{item.ram_gib}</td>
              <td>
                {item.native_reference_price_currency}
                {item.dle_se_price_hourly}
              </td>
              <td>
                {item.native_reference_price_currency}
                {(Number(item.dle_se_price_hourly) * MONTHLY_HOURS).toFixed(2)}
              </td>
            </tr>
          ))}
        </table>
      )}
      <a
        className={`btn btn1 ${styles.tableButton}`}
        target="blank"
        href="https://console.postgres.ai/"
      >
        Set up in minutes
      </a>
      <div className={styles.notes}>
        <h2>How it works:</h2>
        <ul>
          <li>
            DBLab SE is built using open-source components. You install it to
            <i>your</i> infrastructure. You pay PostgresAI for support,
            guaranteed packaging quality, keeping the product up-to-date (think
            Postgres versions, extensions, tools) and feature-rich. You can
            switch from DBLab SE to a free offering (DBLab CE, Community
            Edition) any time, but in this case, you would lose the ability to
            use the DBLab SE bundle and the guaranteed vendor support.
          </li>
          <li>
            PostgresAI teamed up with{' '}
            <a href="https://stripe.com/" target="blank">
              Stripe
            </a>{' '}
            to ensure your billing is both easy and secure.
          </li>
          <li>
            You can use your own hardware (hello, cloud repatriates). Select the
            "BYOM" ("Bring Your Own Machine") option when setting up DBLab SE.
            This also lets you install DBLab SE on a VM in any cloud.
          </li>
          <li>
            For certain clouds like AWS, GCP, DigitalOcean, and Hetzner.Cloud,
            there is a simpler setup available in{' '}
            <a href="https://console.postgres.ai" target="blank">
              the PostgresAI Console
            </a>
            . Costs for cloud resources like VM, storage, network, dedicated IP
            addresses are not part of DBLab SE pricing. You will pay them
            directly to your cloud provider.
          </li>
          <li>
            The price of DBLab SE is based on the "compute" capacity of your
            machine. If the CPU count and RAM size are not an exact match, the
            closest available option is automatically used.
          </li>
          <li>
            DBLab SE pricing is not based on the database size. However, there
            is a current size limit of 2000 GiB for database size of a single
            DBLab SE instance. If you need more, please{' '}
            <a href="mailto:sales@postgres.ai">reach out to us</a>.
          </li>
          <li>DBLab SE billing is calculated on an hourly basis.</li>
          <li>
            You will not be billed for hours when your DBLab SE instance is off.
            However, if you use it for only a portion of an hour, you will still
            be charged for the full hour.
          </li>
          <li>
            To stop charges, just de-provision your DBLab SE instance. The hour
            you shut it down will be considered the final hour for billing.
          </li>
          <li>
            You can manage payment methods, access invoices, and view billed
            hours in the "Billing" section of your organization account.
          </li>
          <li>
            AWS Marketplace users: check out our prices directly on{' '}
            <a href="https://aws.dblab.dev/" target="blank">
              the AWS Marketplace page
            </a>
            .
          </li>
          <li>
            If you have any questions, please{' '}
            <a href="mailto:sales@postgres.ai">contact us</a>.
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Table
