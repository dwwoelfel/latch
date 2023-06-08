import {
  Text,
  Box,
  Checkbox,
  Code,
  Container,
  Flex,
  Select,
  Space,
  Tabs,
  Title,
  Button,
  Anchor,
  CopyButton,
  Tooltip,
  ActionIcon,
  SegmentedControl,
  LoadingOverlay,
  Group,
} from '@mantine/core';
import {PreloadedQuery, useFragment} from 'react-relay';
import {graphql} from 'react-relay';
import {useLoaderData, useOutletContext} from 'react-router-dom';
import RelayModernEnvironment from 'relay-runtime/lib/store/RelayModernEnvironment.js';
import {
  ClientSetupPageFlags$data,
  ClientSetupPageFlags$key,
} from './__generated__/ClientSetupPageFlags.graphql.js';
import type {ClientSetupPageQuery as ClientSetupPageQueryType} from './__generated__/ClientSetupPageQuery.graphql.js';
import ClientSetupPageQuery from './__generated__/ClientSetupPageQuery.graphql.js';
import {
  loadQuery,
  usePaginationFragment,
  usePreloadedQuery,
} from './react-relay';
import {Fragment, useContext, useEffect, useMemo, useState} from 'react';
import {ClientSetupPageServerConfig$key} from './__generated__/ClientSetupPageServerConfig.graphql.js';
import {capitalize} from './util.js';
import {formatValue, friendlyType} from './flagFormUtil.js';
import {OutletContext} from './App.js';
import {IconCheck, IconCopy} from '@tabler/icons-react';

type LoaderData = {
  rootQuery: PreloadedQuery<ClientSetupPageQueryType>;
};

export const loader = (environment: RelayModernEnvironment): LoaderData => {
  return {
    rootQuery: loadQuery(
      environment,
      ClientSetupPageQuery,
      {},
      {
        fetchPolicy:
          typeof window !== 'undefined'
            ? 'store-and-network'
            : 'store-or-network',
      },
    ),
  };
};

function CodeHighlight({code, isLoading}: {code: string; isLoading?: boolean}) {
  const [tokenInfo, setTokenInfo] = useState(null);

  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  useEffect(() => {
    setIsLoadingTokens(true);
    const getUrl = `https://sourcecodeshots.com/api/token-info?code=${encodeURIComponent(
      code,
    )}&theme=light-plus&language=typescript`;

    const resp =
      getUrl.length < 2083
        ? fetch(getUrl, {
            method: 'GET',

            headers: {accept: 'application/json'},
          })
        : fetch('https://sourcecodeshots.com/api/token-info', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application.json',
            },
            body: JSON.stringify({
              code,
              settings: {
                language: 'typescript',
                theme: 'light-plus',
              },
            }),
          });
    let canceled = false;
    resp
      .then((resp) => resp.json())
      .then((tokens) => {
        if (!canceled) {
          setTokenInfo(tokens);
          setIsLoadingTokens(false);
        }
      })
      .catch((e) => {
        console.error(e);
        if (!canceled) {
          setTokenInfo(null);
          setIsLoadingTokens(false);
        }
      });

    return () => {
      canceled = true;
    };
  }, [code]);

  if (!tokenInfo) {
    return <Code block>{code}</Code>;
  } else {
    return (
      <Box pos={'relative'}>
        <LoadingOverlay
          visible={isLoading || isLoadingTokens}
          loader={<div></div>}
        />
        <Box pos={'absolute'} top="0" right="0" p="sm">
          <CopyButton value={code}>
            {({copied, copy}) => (
              <Tooltip
                label={copied ? 'Copied' : 'Copy'}
                withArrow
                position="right">
                <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                  {copied ? (
                    <IconCheck size="1.5rem" />
                  ) : (
                    <IconCopy size="1.5rem" />
                  )}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Box>
        <Code block>
          {tokenInfo.tokens.map((lineTokens, idx) => {
            return (
              <Fragment key={idx}>
                {lineTokens.map((token, tokenIdx) => {
                  const style = {
                    color: token.foregroundColor,
                  };
                  if (token.isItalic) {
                    style.fontStyle = 'italic';
                  }
                  if (token.isBold) {
                    style.fontWeight = 'bold';
                  }
                  if (token.isUnderlined) {
                    style.textDecoration = 'underline';
                  }
                  return (
                    <span key={tokenIdx} style={style}>
                      {token.text}
                    </span>
                  );
                })}
                {idx === tokenInfo.tokens.length - 1 ? null : '\n'}
              </Fragment>
            );
          })}
        </Code>
      </Box>
    );
  }
}

// XXX: Needs a better error boundary (always defaults to login now)

function ClientSetup(props: {
  data: ClientSetupPageFlags$key;
  serverConfigData: ClientSetupPageServerConfig$key;
}) {
  const {data, hasNext, loadNext, isLoadingNext} = usePaginationFragment(
    graphql`
      fragment ClientSetupPageFlags on Viewer
      @argumentDefinitions(
        count: {type: "Int", defaultValue: 1000}
        cursor: {type: "String"}
      )
      @refetchable(queryName: "ClientSetupPageFlagsPaginationQuery") {
        featureFlags(first: $count, after: $cursor)
          @connection(key: "ClientSetupPage_featureFlags") {
          edges {
            node {
              key
              type
              defaultVariation
              environmentVariations
              variations {
                value
              }
            }
          }
        }
      }
    `,
    props.data,
  );

  const serverConfigData = useFragment(
    graphql`
      fragment ClientSetupPageServerConfig on Viewer {
        serverConfig {
          projectId
          bucketName
          topicName
        }
      }
    `,
    props.serverConfigData,
  );

  const serverConfig = serverConfigData.serverConfig;

  useEffect(() => {
    if (!isLoadingNext && hasNext) {
      loadNext(1000);
    }
  }, [isLoadingNext, hasNext]);

  // npm install
  // select flags
  // create client

  const [language, setLanguage] = useState<'ts' | 'js'>('ts');
  const [selectedFlags, setSelectedFlags] = useState<Set<string>>(new Set([]));
  const [packageType, setPackageType] = useState<'esm' | 'cjs'>('esm');
  const [isLoading, setIsLoading] = useState(false);

  const imports = new Set(['LatchClient']);

  const flagMap = useMemo(() => {
    const m = new Map<
      string,
      ClientSetupPageFlags$data['featureFlags']['edges'][number]['node']
    >();
    for (const e of data.featureFlags.edges) {
      m.set(e.node.key, e.node);
    }
    return m;
  }, [data]);

  const flagTypes = [];
  const flagConfigs = [];

  const {env} = useOutletContext<OutletContext>();

  for (const flagKey of selectedFlags) {
    const flag = flagMap.get(flagKey);
    if (flag) {
      const typ = `Latch${capitalize(friendlyType(flag.type))}Flag`;
      flagTypes.push(`  '${flagKey}': ${typ}`);
      if (language === 'ts') {
        imports.add(typ);
      }
      const defaultValue =
        flag.variations[
          flag.environmentVariations[env.name] ?? flag.defaultVariation
        ].value;
      flagConfigs.push(
        `    '${flagKey}': {flagType: '${friendlyType(
          flag.type,
        )}', defaultValue: ${formatValue(flag.type, defaultValue)}}`,
      );
    }
  }

  let code = ``;

  if (packageType === 'esm') {
    code += `import {${[...imports].join(', ')}} from 'node-latch-client';`;
  }
  if (packageType === 'cjs') {
    code += `const {${[...imports].join(
      ', ',
    )}} = require('node-latch-client');`;
  }

  code += '\n\n';

  let clientType = '';

  if (language === 'ts') {
    clientType = `<{
${flagTypes.join(',\n')}
}>`;
  }

  code += `const client = new LatchClient${clientType}({
  environment: '${env.name}',
  bucketName: '${serverConfig.bucketName}',
  topicName: '${serverConfig.topicName}',
  projectId: '${serverConfig.projectId}',
  flags: {
${flagConfigs.join(',\n')}
  }
});

client.on('error', (error) => {
  console.error(error);
})

const setupErrors = await client.init();

if (setupErrors) {
  console.error(setupErrors);
}

// on shutdown, 
// await client.cleanup();
`;

  const [formattedCode, setFormattedCode] = useState(code);

  useEffect(() => {
    let canceled = false;
    setIsLoading(true);
    Promise.all([
      import('prettier/standalone'),
      import('prettier/parser-typescript'),
    ])
      .then(([prettier, parserTypescript]) => {
        const formatted = prettier.format(code, {
          parser: 'typescript',
          plugins: [parserTypescript],
        });
        if (!canceled) {
          setFormattedCode(formatted);
          setIsLoading(false);
        }
      })
      .catch((e) => {
        console.error(e);
        if (!canceled) {
          setFormattedCode(code);
          setIsLoading(false);
        }
      });

    return () => {
      canceled = true;
    };
  }, [code]);

  return (
    <Box>
      <Box>
        <Box w="10em">
          <Select
            data={[
              {label: 'TypeScript', value: 'ts'},
              {label: 'Javascript', value: 'js'},
            ]}
            value={language}
            onChange={(v: 'ts' | 'js') => setLanguage(v)}
            label="Language"
          />
        </Box>
        <Box w="20em" mt="2em">
          <Title order={5}>Install the client</Title>
          <Tabs defaultValue="yarn">
            <Tabs.List>
              <Tabs.Tab value="yarn">yarn</Tabs.Tab>
              <Tabs.Tab value="npm">npm</Tabs.Tab>
              <Tabs.Tab value="pnpm">pnpm</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="yarn">
              <Code block>yarn add latch-client-node</Code>
            </Tabs.Panel>
            <Tabs.Panel value="npm">
              <Code block>npm install latch-client-node</Code>
            </Tabs.Panel>
            <Tabs.Panel value="pnpm">
              <Code block>pnpm add latch-client-node</Code>
            </Tabs.Panel>
          </Tabs>
        </Box>
        <Box mt="2em">
          <Title order={5}>
            Select flags{' '}
            <Text component="span" size="sm" weight={'normal'}>
              <Anchor
                variant="subtle"
                onClick={() =>
                  setSelectedFlags(
                    data.featureFlags.edges.length <= selectedFlags.size
                      ? new Set([])
                      : new Set(data.featureFlags.edges.map((e) => e.node.key)),
                  )
                }>
                {data.featureFlags.edges.length <= selectedFlags.size
                  ? 'deselect all'
                  : 'select all'}
              </Anchor>
            </Text>
          </Title>
          <Box>
            {data.featureFlags.edges.map(({node}) => {
              return (
                <Checkbox
                  p="sm"
                  checked={selectedFlags.has(node.key)}
                  onChange={(event) => {
                    setSelectedFlags((flags) => {
                      const next = new Set(flags);
                      if (event.target.checked) {
                        next.add(node.key);
                      } else {
                        next.delete(node.key);
                      }
                      return next;
                    });
                  }}
                  key={node.key}
                  value={node.key}
                  label={node.key}
                />
              );
            })}
          </Box>
        </Box>
        <Box mt="2em" mb="5em">
          <Title order={5}>Code</Title>
          <Group align="center" position="center">
            <SegmentedControl
              value={packageType}
              onChange={(v: 'esm' | 'cjs') => setPackageType(v)}
              data={[
                {label: 'ESM', value: 'esm'},
                {label: 'CommonJS', value: 'cjs'},
              ]}
            />
          </Group>
          <CodeHighlight code={formattedCode} isLoading={isLoading} />
        </Box>
      </Box>
    </Box>
  );
}

export function ClientSetupPage() {
  const {rootQuery} = useLoaderData() as LoaderData;
  const data = usePreloadedQuery(
    graphql`
      query ClientSetupPageQuery {
        viewer {
          ...ClientSetupPageFlags @arguments(count: 1000)
          ...ClientSetupPageServerConfig
        }
      }
    `,
    rootQuery,
  );

  console.log('root', data);

  return (
    <Container size="sm">
      <Flex direction={'column'}>
        <Title order={2}>Client setup</Title>
        <Space h="md" />
        <ClientSetup data={data.viewer} serverConfigData={data.viewer} />
      </Flex>
    </Container>
  );
}
