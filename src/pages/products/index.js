import React from 'react';
import Layout from '@theme/Layout';

function Hello() {
  return (
    <Layout title="Hello">
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '20vh',
          fontSize: '20px',
        }}>
        <p>
          TODO: Products table here.
        </p>
      </div>
      <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '20vh',
        fontSize: '20px',
      }}>
        <ul>
          <li><a href="/">Database Lab Engine</a></li>
          <li><a href="/products/joe">Joe Bot for SQL Optimization</a></li>
          <li><a href="/products/postgres-checkup">Postgres-checkup</a></li>
        </ul>
      </div>
    </Layout>
  );
}

export default Hello;
