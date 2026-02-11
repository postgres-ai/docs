---
title: Data Processing Addendum (DPA)
sidebar_label: DPA
---

<div className="legal-page">

# Data Processing Addendum (DPA)

**Effective Date:** Upon execution by both parties

---

:::caution NOTICE

This Data Processing Addendum (DPA) is provided for **review purposes only**. To make this DPA legally binding between your organization and PostgresAI, **both parties must execute (sign) a copy**.

### To Request a Signed DPA

Send an email to **legal@postgres.ai** with:
- Subject: `DPA Execution Request - [Your Company Name]`
- Contact name and title
- Company address

We will send you a DocuSign envelope for execution within 5 business days.

:::

---

## Parties

**Data Processor:** Nombox LLC d.b.a. PostgresAI ("PostgresAI" or "Processor")
- Address: 421 Broadway #5120, San Diego, CA 92101, US
- Email: privacy@postgres.ai

**Data Controller:**  
[Customer legal entity to be filled upon execution]

---

## 1. Introduction

This Data Processing Addendum ("DPA") supplements the Agreement (as defined below) between PostgresAI and Customer and sets forth the parties' responsibilities regarding the processing of Personal Data under Applicable Data Protection Laws.

### 1.1 Definitions

**"Agreement"** means the Terms of Service between PostgresAI and Customer, available at https://postgres.ai/tos/, or such other written agreement between the parties that governs Customer's use of the Services.

**"Applicable Data Protection Laws"** means all laws and regulations applicable to the Processing of Personal Data under the Agreement, including:
- General Data Protection Regulation (EU) 2016/679 ("GDPR")
- UK GDPR (GDPR as saved into UK law)
- Swiss Federal Data Protection Act ("Swiss DPA")
- California Consumer Privacy Act ("CCPA") and California Privacy Rights Act ("CPRA")
- Virginia Consumer Data Protection Act ("VCDPA")
- Colorado Privacy Act ("CPA")
- Utah Consumer Privacy Act ("UCPA")
- Connecticut Data Privacy Act ("CTDPA")

**"Covered Data"** means Personal Data that is provided by or on behalf of Customer to PostgresAI in connection with Customer's use of the Services.

**"Data Subject"** means the identified or identifiable natural person to whom Personal Data relates.

**"Personal Data"** means any information relating to an identified or identifiable natural person, as defined under Applicable Data Protection Laws.

**"Processing"** means any operation or set of operations which is performed upon Personal Data, whether or not by automatic means.

**"Security Incident"** means a confirmed unauthorized or unlawful breach of security that leads to the accidental or unlawful destruction, loss, alteration, unauthorized disclosure of or access to Covered Data.

**"Standard Contractual Clauses"** or **"SCCs"** means:
- EU SCCs: Standard contractual clauses annexed to Commission Implementing Decision (EU) 2021/914
- UK SCCs: Applicable standard data protection clauses under UK GDPR
- Swiss SCCs: Standard data protection clauses recognized by FDPIC

---

## 2. Roles and Responsibilities

### 2.1 Role of Parties

PostgresAI acts as a **processor** (or service provider under CCPA) and Customer acts as a **controller** (or business under CCPA) under this DPA.

### 2.2 Controller Obligations

Customer shall:
- Comply with its obligations under Applicable Data Protection Laws
- Obtain valid consents from Data Subjects where required
- Implement appropriate technical and organizational measures
- Respond to Data Subject requests within required timeframes

### 2.3 Processor Obligations

PostgresAI shall:
- Process Covered Data only to provide the Services
- Process Covered Data in accordance with Customer's documented instructions
- Not use Covered Data for any other purpose
- Not sell Covered Data or use it for cross-context behavioral advertising

---

## 3. Details of Processing

### 3.1 Categories of Personal Data

| Category | Description |
|----------|-------------|
| Contact information | Name, email address, phone number |
| Account credentials | Username, password (encrypted) |
| Usage information | Login activity, feature usage |
| Database metadata | Schema info, query statistics, performance metrics |
| Query data | SQL query text and execution plans (AI features only, with explicit consent) |
| Support data | Communications via Slack, Zoom, email |

### 3.2 Data Subjects

- Authorized Users (Customer's employees and contractors)
- End Users (if Personal Data stored in Customer databases)

### 3.3 Processing Details

| Detail | Description |
|--------|-------------|
| **Nature** | Collection, storage, analysis, transmission |
| **Purpose** | Provision of database monitoring, AI assistance, and related services |
| **Duration** | Duration of Agreement |
| **Geographic Storage** | Platform data: USA (Google Cloud Platform). Monitoring data: Customer-selected region (AWS or Hetzner regions globally). |

### 3.4 Data Retention

| Data Type | Retention Period |
|-----------|------------------|
| Monitoring instance data | Deleted immediately upon instance deletion |
| Derived data (checkups, Issues) | Retained until organization deletion |
| Post-termination | Deleted within 30 days of written deletion request |

---

## 4. Subprocessors

PostgresAI may engage subprocessors as listed at https://postgres.ai/docs/platform/service-providers.

Customer grants general authorization for these subprocessors. PostgresAI will:
- Notify Customer of new subprocessors at least 30 days in advance by email to the address associated with Customer's account or by posting an update to the Subprocessors page
- Enter into written agreements with subprocessors imposing data protection obligations
- Remain liable for subprocessor compliance

Customer may object to new subprocessors by providing written notice within 15 days. If objection cannot be resolved, Customer may terminate affected Services.

### 4.1 AI Subprocessors and Customer Controls

Certain Services include AI-powered features that may transmit data to third-party LLM providers (Anthropic, Google, OpenAI) as listed in the Subprocessor List. The following controls apply:

- **Explicit consent required:** No data is sent to any LLM provider without explicit user confirmation
- **Organization administrator controls:** Customer's organization administrators can enable or disable AI features entirely, and can selectively enable or disable specific LLM providers through the PostgresAI Console settings
- **No Customer Data by default:** Customer database content (table data, row values) is never sent to LLM providers. Only query text, execution plans, and natural language questions are sent, and only upon explicit user action
- **Full disable option:** Organization administrators may disable all AI features. This will reduce platform functionality but the core monitoring and database management services remain fully operational

For full details on data sent to each AI feature, see the [Privacy Policy](https://postgres.ai/privacy/).

---

## 5. Security

PostgresAI implements appropriate technical and organizational measures:

- Encryption in transit (TLS 1.2+)
- Encryption at rest (AES-256)
- Role-based access controls
- Regular security assessments and penetration testing
- Security Incident response procedures

### 5.1 Audit Rights

PostgresAI will make available to Customer, upon reasonable request, information necessary to demonstrate compliance with this DPA. PostgresAI will permit and contribute to audits conducted by Customer or an independent third-party auditor mandated by Customer, subject to the following conditions:

- Audits may be conducted no more than once per twelve (12) month period
- Customer must provide at least thirty (30) days' prior written notice
- Audits will be conducted during normal business hours and at Customer's expense
- PostgresAI may satisfy audit requests by providing: (a) SOC 2 Type II reports or equivalent certifications; (b) completed security questionnaire responses; or (c) other documentation reasonably demonstrating compliance
- **Open-source components** (exporters, VictoriaMetrics/Postgres, Grafana dashboards): Fully inspectable by Customer (Apache 2.0 license)
- Auditor must execute a confidentiality agreement acceptable to PostgresAI prior to any audit

### 5.2 Personnel Confidentiality

PostgresAI ensures that persons authorized to process Covered Data have committed to confidentiality or are under an appropriate statutory obligation of confidentiality. Access to Covered Data is limited to personnel who require such access to perform their duties in connection with the Services.

---

## 6. Security Incidents

PostgresAI will:
- Notify Customer of any Security Incident within 24 hours of discovery
- Provide information to help Customer meet breach notification obligations
- Take reasonable steps to mitigate effects and minimize damage

---

## 7. Data Subject Rights

PostgresAI will assist Customer, at Customer's reasonable expense, in responding to:
- Access requests
- Rectification requests
- Erasure requests ("right to be forgotten")
- Data portability requests
- Restriction of processing requests
- Objection to processing

---

## 8. Data Protection Impact Assessments

PostgresAI will provide reasonable assistance to Customer in conducting Data Protection Impact Assessments (DPIAs) and prior consultations with supervisory authorities, as required under Articles 35 and 36 of the GDPR, to the extent that such assessment relates to PostgresAI's Processing of Covered Data. Such assistance will be provided at Customer's reasonable expense.

---

## 9. International Transfers

For transfers of Covered Data outside the European Economic Area, the parties agree to the **EU Standard Contractual Clauses (Module Two: Controller to Processor)**, which are incorporated by reference.

For UK transfers, the UK SCCs apply. For Swiss transfers, the Swiss SCCs apply.

The completed SCCs, including Annexes I (parties and processing details), II (technical and organizational measures), and III (subprocessors), will be appended to the executed copy of this DPA.

---

## 10. Termination

Upon termination of the Agreement, PostgresAI will:
- Delete or return all Covered Data within 30 days
- Provide certification of deletion upon request
- Retain data only where required for legal compliance

---

## 11. Liability

Each party's liability under this DPA is subject to the limitations set forth in the Agreement.

---

## Execution

To make this DPA legally binding, both parties must execute a copy below:

**FOR POSTGRESAI:**

Name: _________________________  
Title: _________________________  
Date: _________________________  

**FOR CUSTOMER:**

Name: _________________________  
Title: _________________________  
Date: _________________________  
Company: _______________________

---

*This DPA forms part of the Agreement between the parties. In case of conflict, this DPA prevails with respect to data protection matters.*

---

## Related Documents

- [Terms of Service](/tos/)
- [Privacy Policy](/privacy/)
- [Subprocessors](/docs/platform/service-providers/)

</div>
