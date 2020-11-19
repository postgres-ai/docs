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
          TODO: Add landing here.
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
          <li><a href="/docs/">Docs</a></li>
          <li><a href="/tos/">TOS</a></li>
          <li><a href="/blog/">Blog</a></li>
        </ul>
      </div>
    </Layout>
  );
}

export default Hello;
