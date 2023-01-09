import * as express from 'express';
import { readFileSync } from 'fs';
import { createServer } from 'https';

const app = express();
app.use(express.json());

const httpPort = process.env.HTTP_PORT ?? '80';
const httpsPort = process.env.HTTPS_PORT ?? '443';
const silent = process.env.SILENT === 'true';

const managePrefix = '[manage]';

interface EventGrid {
  domains: Record<string, EventGridDomain>;
}

interface EventGridDomain {
  topics: Record<string, EventGridDomainTopic>;
}

interface EventGridDomainTopic {
  eventSubscriptions: { name: string }[];
  actions: EventGridDomainTopicEventSubscriptionAction[];
}

interface EventGridDomainTopicEventSubscriptionAction {
  action: 'put' | 'delete';
  id: string;
  payload: any;
}

let data: Record<string, Record<string, EventGrid>> = {};

app.get('/health', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200);
  res.send({});
});

app.get(
  '//subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/providers/Microsoft.EventGrid/domains/:domainName/topics/:topicName/providers/Microsoft.EventGrid/eventSubscriptions/:eventSubscriptionName',
  (req, res) => {
    const { subscriptionId, resourceGroupName, domainName, topicName, eventSubscriptionName } = req.params;
    if (!data[subscriptionId]) {
      res.status(404);
      const message = `could not find /subscriptions/${subscriptionId}`;
      console.error(message);
      res.send({ message });
    } else if (!data[subscriptionId][resourceGroupName]) {
      res.status(404);
      const message = `could not find /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`;
      console.error(message);
      res.send({ message });
    } else if (!data[subscriptionId][resourceGroupName].domains[domainName]) {
      res.status(404);
      const message = `could not find /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.EventGrid/domains/${domainName}`;
      console.error(message);
      res.send({ message });
    } else if (!data[subscriptionId][resourceGroupName].domains[domainName].topics[topicName]) {
      res.status(404);
      const message = `could not find /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.EventGrid/domains/${domainName}/topics/${topicName}`;
      console.error(message);
      res.send({ message });
    } else {
      const sub = data[subscriptionId][resourceGroupName].domains[domainName].topics[topicName].eventSubscriptions.find(
        (sub) => sub.name === eventSubscriptionName
      );
      if (sub) {
        res.status(200);
        res.send(sub);
      } else {
        res.status(404);
        const message = `could not find /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.EventGrid/domains/${domainName}/topics/${topicName}/eventSubscriptions/${subscriptionId}`;
        console.error(message);
        res.send({ message });
      }
    }
  }
);

app.get(
  '/subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/providers/Microsoft.EventGrid/domains/:domainName/topics/:topicName/providers/Microsoft.EventGrid/eventSubscriptions/:eventSubscriptionName?',
  (req, res) => {
    const { subscriptionId, resourceGroupName, domainName, topicName } = req.params;
    if (!data[subscriptionId]) {
      res.status(404);
      const message = `could not find /subscriptions/${subscriptionId}`;
      console.error(message);
      res.send({ message });
    } else if (!data[subscriptionId][resourceGroupName]) {
      res.status(404);
      const message = `could not find /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`;
      console.error(message);
      res.send({ message });
    } else if (!data[subscriptionId][resourceGroupName].domains[domainName]) {
      res.status(404);
      const message = `could not find /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.EventGrid/domains/${domainName}`;
      console.error(message);
      res.send({ message });
    } else if (!data[subscriptionId][resourceGroupName].domains[domainName].topics[topicName]) {
      res.status(404);
      const message = `could not find /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.EventGrid/domains/${domainName}/topics/${topicName}`;
      console.error(message);
      res.send({ message });
    } else {
      if (req.params.eventSubscriptionName) {
        const sub = data[subscriptionId][resourceGroupName].domains[domainName].topics[
          topicName
        ].eventSubscriptions.find((sub) => sub.name === req.params.eventSubscriptionName);
        if (sub) {
          res.status(200);
          res.send(data[subscriptionId][resourceGroupName].domains[domainName].topics[topicName]);
        } else {
          res.status(404);
          const message = `could not find /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.EventGrid/domains/${domainName}/topics/${topicName}/eventSubscriptions/${subscriptionId}`;
          console.error(message);
          res.send({ message });
        }
      } else {
        res.status(200);
        res.send(data[subscriptionId][resourceGroupName].domains[domainName].topics[topicName]);
      }
    }
  }
);

// /subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/providers/Microsoft.EventGrid/domains/:domainName/topics/:topicName is the scope of the subscription -> should be made dynamic in a futur version
app.put(
  '//subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/providers/Microsoft.EventGrid/domains/:domainName/topics/:topicName/providers/Microsoft.EventGrid/eventSubscriptions/:eventSubscriptionName',
  (req, res) => {
    const { subscriptionId, resourceGroupName, domainName, topicName, eventSubscriptionName } = req.params;
    const scope = `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.EventGrid/domains/${domainName}/topics/${topicName}`;
    if (!silent) console.log(`create subscription for scope ${scope} => ${JSON.stringify(req.body.properties)}`);
    if (!data[subscriptionId]) {
      res.status(404);
      const message = `could not find /subscriptions/${subscriptionId}`;
      console.error(message);
      res.send({ message });
    } else if (!data[subscriptionId][resourceGroupName]) {
      res.status(404);
      const message = `could not find /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`;
      console.error(message);
      res.send({ message });
    } else if (!data[subscriptionId][resourceGroupName].domains[domainName]) {
      res.status(404);
      const message = `could not find /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.EventGrid/domains/${domainName}`;
      console.error(message);
      res.send({ message });
    } else if (!data[subscriptionId][resourceGroupName].domains[domainName].topics[topicName]) {
      res.status(404);
      const message = `could not find /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.EventGrid/domains/${domainName}/topics/${topicName}`;
      console.error(message);
      res.send({ message });
    } else {
      const newSub = {
        name: eventSubscriptionName,
        ...req.body.properties,
        destination: {
          endpointType: req.body.properties?.destination?.endpointType,
          ...req.body.properties?.destination?.endpointType?.properties,
        },
      };
      data[subscriptionId][resourceGroupName].domains[domainName].topics[topicName].eventSubscriptions.push(newSub);
      data[subscriptionId][resourceGroupName].domains[domainName].topics[topicName].actions.push({
        action: 'put',
        id: scope,
        payload: req.body,
      });
      res.status(200);
      res.send(newSub);
    }
  }
);

app.get('/manage-api/cert', (_req, res) => {
  res.setHeader('Content-Type', 'application/x-pem-file');
  res.status(200);
  res.send(readFileSync('server.cert'));
});

app.post('/manage-api/clear', (_req, res) => {
  if (Object.keys(data).length > 0) {
    if (!silent) console.log(`${managePrefix} clear all data`);
    data = {};
  }
  res.setHeader('Content-Type', 'application/json');
  res.status(200);
  res.send({});
});

app.put('/manage-api/subscriptions/:subscriptionId', (req, res) => {
  const { subscriptionId } = req.params;
  if (!silent) console.log(`${managePrefix} create subscription ${subscriptionId}`);
  data[subscriptionId] = {};
  res.setHeader('Content-Type', 'application/json');
  res.status(200);
  res.send({});
});

app.put('/manage-api/subscriptions/:subscriptionId/resourceGroups/:resourceGroupName', (req, res) => {
  const { subscriptionId, resourceGroupName } = req.params;
  if (!data[subscriptionId]) {
    res.status(404);
    const message = `${managePrefix} could not find /subscriptions/${subscriptionId}`;
    console.error(message);
    res.send({ message });
  } else {
    if (!silent) console.log(`${managePrefix} create resource group ${subscriptionId}/${resourceGroupName}`);
    data[subscriptionId][resourceGroupName] = { domains: {} };
    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    res.send({});
  }
});

app.put(
  '/manage-api/subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/domains/:domainName',
  (req, res) => {
    const { subscriptionId, resourceGroupName, domainName } = req.params;
    if (!data[subscriptionId]) {
      res.status(404);
      const message = `${managePrefix} could not find /subscriptions/${subscriptionId}`;
      console.error(message);
      res.send({ message });
    } else if (!data[subscriptionId][resourceGroupName]) {
      res.status(404);
      const message = `${managePrefix} could not find /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`;
      console.error(message);
      res.send({ message });
    } else {
      if (!silent)
        console.log(`${managePrefix} create event grid domain ${subscriptionId}/${resourceGroupName}/${domainName}`);
      data[subscriptionId][resourceGroupName].domains[domainName] = { topics: {} };
      res.setHeader('Content-Type', 'application/json');
      res.status(200);
      res.send({});
    }
  }
);

app.put(
  '/manage-api/subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/domains/:domainName/topics/:topicName',
  (req, res) => {
    const { subscriptionId, resourceGroupName, domainName, topicName } = req.params;
    if (!data[subscriptionId]) {
      res.status(404);
      const message = `${managePrefix} could not find /subscriptions/${subscriptionId}`;
      console.error(message);
      res.send({ message });
    } else if (!data[subscriptionId][resourceGroupName]) {
      res.status(404);
      const message = `${managePrefix} could not find /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`;
      console.error(message);
      res.send({ message });
    } else if (!data[subscriptionId][resourceGroupName].domains[domainName]) {
      res.status(404);
      const message = `${managePrefix} could not find /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.EventGrid/domains/${domainName}`;
      console.error(message);
      res.send({ message });
    } else {
      if (!silent)
        console.log(
          `${managePrefix} create event grid domain topic ${subscriptionId}/${resourceGroupName}/${domainName}/${topicName}`
        );
      data[subscriptionId][resourceGroupName].domains[domainName].topics[topicName] = {
        eventSubscriptions: [],
        actions: [],
      };
      res.setHeader('Content-Type', 'application/json');
      res.status(200);
      res.send({});
    }
  }
);

app.put(
  '/manage-api/subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/domains/:domainName/topics/:topicName/eventSubscriptions',
  (req, res) => {
    const { subscriptionId, resourceGroupName, domainName, topicName } = req.params;
    if (!data[subscriptionId]) {
      res.status(404);
      const message = `${managePrefix} could not find /subscriptions/${subscriptionId}`;
      console.error(message);
      res.send({ message });
    } else if (!data[subscriptionId][resourceGroupName]) {
      res.status(404);
      const message = `${managePrefix} could not find /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`;
      console.error(message);
      res.send({ message });
    } else if (!data[subscriptionId][resourceGroupName].domains[domainName]) {
      res.status(404);
      const message = `${managePrefix} could not find /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.EventGrid/domains/${domainName}`;
      console.error(message);
      res.send({ message });
    } else if (!data[subscriptionId][resourceGroupName].domains[domainName].topics[topicName]) {
      res.status(404);
      const message = `${managePrefix} could not find /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.EventGrid/domains/${domainName}/topics/${topicName}`;
      console.error(message);
      res.send({ message });
    } else {
      const body = JSON.stringify(req.body);
      const message = `${managePrefix} create event grid domain topic subscription ${subscriptionId}/${resourceGroupName}/${domainName}/${topicName} => ${body}`;
      if (!silent) console.log(message);
      data[subscriptionId][resourceGroupName].domains[domainName].topics[topicName].eventSubscriptions.push(req.body);
      res.setHeader('Content-Type', 'application/json');
      res.status(200);
      res.send({});
    }
  }
);

app.get(
  '/manage-api/subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/domains/:domainName/topics/:topicName/event-subscription-actions',
  (req, res) => {
    const { subscriptionId, resourceGroupName, domainName, topicName } = req.params;
    if (!data[subscriptionId]) {
      res.status(404);
      const message = `${managePrefix} could not find /subscriptions/${subscriptionId}`;
      console.error(message);
      res.send({ message });
    } else if (!data[subscriptionId][resourceGroupName]) {
      res.status(404);
      const message = `${managePrefix} could not find /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`;
      console.error(message);
      res.send({ message });
    } else if (!data[subscriptionId][resourceGroupName].domains[domainName]) {
      res.status(404);
      const message = `${managePrefix} could not find /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.EventGrid/domains/${domainName}`;
      console.error(message);
      res.send({ message });
    } else if (!data[subscriptionId][resourceGroupName].domains[domainName].topics[topicName]) {
      res.status(404);
      const message = `${managePrefix} could not find /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.EventGrid/domains/${domainName}/topics/${topicName}`;
      console.error(message);
      res.send({ message });
    } else {
      if (!silent)
        console.log(
          `create event grid domain topic subscription ${subscriptionId}/${resourceGroupName}/${domainName}/${topicName} => ${JSON.stringify(
            req.body
          )}`
        );
      res.setHeader('Content-Type', 'application/json');
      res.status(200);
      res.send(data[subscriptionId][resourceGroupName].domains[domainName].topics[topicName].actions);
    }
  }
);

function printUnknownRequest({
  method,
  url,
  baseUrl,
  originalUrl,
  params,
  query,
  headers,
  hostname,
  body,
}: express.Request<{}, any, any, any, Record<string, any>>): void {
  console.error(
    `Unknown request: ${JSON.stringify({ method, url, baseUrl, originalUrl, params, query, headers, hostname, body })}`
  );
}

app.post('*', (req, res) => {
  printUnknownRequest(req);
  res.status(200);
  res.send({});
});

app.get('*', (req, res) => {
  printUnknownRequest(req);
  res.status(200);
  res.send({});
});

app.put('*', (req, res) => {
  printUnknownRequest(req);
  res.status(200);
  res.send({});
});

app.listen(httpPort, () => {
  if (!silent) console.log(`[startup] Event Grid Mock listen unencrypted on ${httpPort}`);
});

createServer({ key: readFileSync('server.key'), cert: readFileSync('server.cert') }, app).listen(httpsPort, () => {
  if (!silent) console.log(`[startup] Event Grid Mock listen encrypted on ${httpsPort}`);
});
