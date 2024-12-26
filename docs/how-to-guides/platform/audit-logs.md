---
title: Audit logs and SIEM integration
sidebar_label: Audit logs and SIEM
---

The Audit Logs feature captures critical system events.

Organization owners and admins can view events in the Platform UI and configure event forwarding to a [SIEM (Security Information and Event Management)](https://en.wikipedia.org/wiki/Security_information_and_event_management) for enhanced security monitoring and compliance (Enterprise subscription required).

## Accessing audit logs
To view recent audit logs, choose **Audit** in the left panel:
![Audit logs page / Accessing audit logs](/assets/guides/audit-logs-0.png)

Only organization owner and admins can access audit logs.

## Audit events
Currently, the following events are captured:

| Event category (code) | Available actions | Notes |
| ----------- | ----------------- | ------- |
| Organization settings (`orgs`) | `update` |  |
| Organization membership (`users_orgs`) | add (`insert`), remove (`delete`) |  |
| API tokens (`api_tokens`) | generate (`insert`), update (`update`) |  |
| DBLab Engine instances (`dblab_instances`) | add (`insert`), remove (`delete`) |  |
| Joe bot instances (`joe_instances`) | add (`insert`), remove (`delete`) |  |
| Joe bot messages (`joe_messages`) | create (`insert`), update (`update`), remove (`delete`) | Only user-created messages |
| AI Assistant messages (`chats`) | create (`insert`), update (`update`) | Only user-created messages |

The DBLab Engine actions (snapshot, branch, clone creation/modification/deletion) are not currently supported in SIEM integration.

## Enabling SIEM Integration
Admins of organizations having Enterprise subscription can configure integration with a SIEM system such as IBM QRadar SIEM, Splunk Enterprise Security, SumoLogic Cloud SIEM, Devo, Exabeam (LogRythm) SIEM.

### 1. Enable SIEM integration
Go to **Manage → Audit settings** and enable SIEM integration:
![Audit logs page / Enable SIEM integration](/assets/guides/audit-logs-1.png)

### 2. Configure SIEM connection settings
Enter your SIEM API endpoint URL (e.g., https://example.com/endpoint), add required HTTP headers (e.g., authorization tokens), and click **Test Connection** to verify:
![Audit logs page / Configure SIEM connection settings](/assets/guides/audit-logs-2.png)

### 3. Configure what to forward and save
Choose what categories of events that need to be forwarded to SIEM, and then press **Save**:
![Audit logs page / Configure what to forward and save](/assets/guides/audit-logs-3b.png)

### Message format for SIEM integration
Logs are sent as JSON payloads containing:
- ID (UUIDv7, `id`)
- Timestamp (ISO 8601, `timestamp`)
- Event data (`event`):
    - Category, according to [the list above](#audit-events) (`event.category`)
    - Action: `insert`, `update`, or `delete` (`action`)
- Organization info (`org`):
    - Postgres.AI organization ID (`org.id`)
    - Name (`org.name`)
    - Alias (`org.alias`)
- Actor (user) information (`actor`):
    - Postgres.AI user ID (`actor.id`)
    - Email (`actor.email`)
    - Name (`actor.first_name`, `actor.last_name`)
- Changes (`changes`), including:
    - Affected record count (`changes.processed_row_count`)
    - Array of full records before the action, if any (`changes.data_before`)
    - Array of full records after the action, if any (`changes.data_after`)

Example payload (changing organization settings):
```json
{
  "id": "0193fe52-5bed-75a4-8aec-829c1bdd9b7f",
  "timestamp": "2024-12-25 14:57:10+00",
  "event": {
    "category": "orgs",
    "action": "update"
  },
  "org": {
    "id": 123,
    "name": "test",
    "alias": "test"
  },
  "actor": {
    "id": 1234,
    "email": "bogdan@postgres.ai",
    "first_name": "Bogdan",
    "last_name": "Tsechoev"
  },
  "changes": {
    "processed_row_count": 1,
    "data_before": [{
      "id": 123,
      "siem_integration_enabled": false,
      "siem_integration_url": null
    }],
    "data_after": [{
      "id": 123,
      "siem_integration_enabled": true,
      "siem_integration_url": "https://new-siem.example.com/path"
    }]
  }
}
```