---
author: "Nikolay Samokhvalov"
date: 2020-05-23 21:19:00
linktitle: "plan-exporter: visualize PostgreSQL EXPLAIN data right from psql"
title: "plan-exporter: visualize PostgreSQL EXPLAIN data right from psql"
description: No more headache with copy-pasting huge plans from psql to explain.dalibo.com and explain.depesz.com
weight: 0
image: /assets/plan-exporter2.png
tags:
  - psql
  - EXPLAIN
  - visualization
---

import { AuthorBanner } from '../src/components/AuthorBanner'
import { DbLabBanner } from '../src/components/DbLabBanner'

If you love and use psql (like I do), you're equipped with a lot of power. However, when you want to visualize execution plans — using such services as good old [explain.depesz.com](https://explain.depesz.com) or modern [explain.dalibo.com](https://explain.dalibo.com) — you need to deal with inconvenient copy-pasting.

To solve this problem, my colleague Artyom Kartasov has developed a small utility called [plan-exporter](https://github.com/agneum/plan-exporter). It allows sending EXPLAIN data with minimal efforts:

<iframe width="560" height="315" src="https://www.youtube.com/embed/8H-Gu-bt5AU" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

To enable plan-exporter you need to use `\o` with a pipe:

```
\o | plan-exporter
```

After this, psql will start mirroring the output to plan-exporter. When plan-exporter sees the EXPLAIN data, it suggests you sending it to a visualization service.

Both services mentioned above are supported and can be chosen using `--target` option. The default is explain.depesz.com.

To reset, just use `\o` command without parameters – and `plan-exporter` will stop receiving the data. And if you want to always have it enabled when you start psql, consider adjusting your `.psqlrc` file:

```bash
echo '\o | plan-exporter --target=dalibo' >> ~/.psqlrc
```

<!--truncate-->

<AuthorBanner
  avatarUrl="/assets/author/nik.jpg"
  name="Nikolay Samokhvalov"
  role="CEO & Founder of"
  twitterUrl="https://twitter.com/samokhvalov"
  gitlabUrl="https://gitlab.com/NikolayS"
  githubUrl="https://github.com/NikolayS"
  linkedinUrl="https://www.linkedin.com/in/samokhvalov"
  note="Working on tools to balance Dev with Ops in DevOps"
/>

<DbLabBanner />
