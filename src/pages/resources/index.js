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
          TODO: Resources table here.
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
          <li><a target="_blank" href="/download/database-lab-case-study-cdek.pdf">Case study: CDEK</a></li>
          <li><a target="_blank" href="/download/database-lab-case-study-qiwi-rocketbank.pdf">Case study: QIWI</a></li>
          <li><a target="_blank" href="https://www.katacoda.com/postgres-ai/scenarios/database-lab-tutorial">Katacoda: Database Lab tutorial</a></li>
          <li><a target="_blank" href="/get-whitepaper-how-to-prepare-postgreqsl-databases-for-black-friday-and-cyber-monday">How to Prepare PostgreSQL Databases for Black Friday</a></li>
        </ul>
      </div>
    </Layout>
  );
}

export default Hello;

/*
Do not delete until moved to proper separate pages!

---
linktitle: "CDEK: Speed up Product Development with Database Lab"
title: "CDEK: Speed up Product Development with Database Lab"
date: "2020-11-03 15:00:00"
description: "Learn how Database Lab speeding up development in a logistics company."
weight: 0
image: /assets/images/thumbnails/case-study-cdek.png
kind: Case study
redirect: /download/database-lab-case-study-cdek.pdf
tags:
  - Postgres.ai
  - Database Lab
  - PostgreSQL
  - case study
  - CDEK
  - logistics
---
linktitle: "Qiwi: Control the Data with Database Lab to Accelerate Development"
title: "Qiwi: Control the Data with Database Lab to Accelerate Development"
date: "2020-11-11 15:00:00"
description: "Learn how banks can overcome test data management pitfalls to eliminate production downtime related to data operations."
weight: 0
image: /assets/images/thumbnails/case-study-qiwi.png
kind: Case study
redirect: /download/database-lab-case-study-qiwi-rocketbank.pdf
tags:
  - Postgres.ai
  - Database Lab
  - PostgreSQL
  - case study
  - bank
  - Qiwi
  - RocketBank
  - finance
---
linktitle: "Tutorial: Database Lab Engine"
title: "Tutorial: Database Lab Engine"
date: "2020-11-01 15:00:00"
weight: 0
image: /assets/images/thumbnails/katakoda-tutorial-dle.png
kind: Katacoda
redirect: https://www.katacoda.com/postgres-ai/scenarios/database-lab-tutorial
tags:
  - Postgres.ai
  - Database Lab
  - PostgreSQL
  - release
---
linktitle: "Learn about best practices in preparing PostgreSQL databases for peak seasons in e-commerce companies."
title: How to Prepare PostgreSQL Databases for Black Friday
date: "2020-11-05 15:00:00"
description: "Learn about best practices in preparing PostgreSQL databases for peak seasons in e-commerce companies."
weight: 0
image: /assets/images/thumbnails/wp1.png
kind: White paper
redirect: "/get-whitepaper-how-to-prepare-postgreqsl-databases-for-black-friday-and-cyber-monday"
tags:
  - Postgres.ai
  - Database Lab
  - PostgreSQL
  - release
---
*/
