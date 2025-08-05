---
title: DBLab Engine user interface
sidebar_label: DBLab UI
description: Embedded visual interface for interacting with DBLab Engine
keywords:
- "DBLab Engine UI"
- "DLE user interface"
- "Built-in DBLab UI"
---

DBLab Engine comes with a basic UI. The DBLab Platform (PostgresAI Platform) extends the UI with more features, such as user management, SSO, audit logs. You can see the feature differentiation on the [Pricing page](/pricing).

## What is the DBLab UI?
DBLab UI is a web UI application that allows observing the current state of the instance and performing basic operations with clones, snapshots, and branches.

This application is delivered as a separate container automatically managed by the DLE itself.

## How it works
DLE manages the embedded UI satellite container, starting it upon initiation and stopping it before the DLE main container shuts down.

In addition, the Engine monitors its configuration and aligns the embedded UI state with it.

For example, if the instance configuration is reloaded and any of the embedded UI parameters (such as the actual Docker image, port, etc.) have changed, the embedded UI container will be automatically restarted.

## Accessing the Database Lab UI
When running, the UI container connects to the internal DLE Docker network and exposes a port for localhost access only, operating over HTTP (insecure). The exposed port can be defined in the Database Lab configuration. To access the UI remotely, for security purposes, it is recommended to use encrypted communication, such as employing SSH port forwarding or setting up additional software like NGINX or Envoy to enable HTTPS.

DBLab UI accepts:
- the **verification token** specified in the configuration file (DLE CE, DLE SE) – the same that is used with DLE API and CLI
- and **personal tokens** if the [Secure User Access Tokens](https://postgres.ai/pricing) feature is activated (requires integration with the PostgresAI Platform, DLE EE only)

From version 3.0 onwards, DLE can be run with an empty verification token, although this is not recommended. In such cases, the UI application will not require any credentials.
