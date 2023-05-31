import {Environment, RecordSource, Store} from 'relay-runtime';
import {Network} from 'relay-runtime/lib/network/RelayNetworkTypes';
import {RecordMap} from 'relay-runtime/lib/store/RelayStoreTypes';

export const createEnvironment = (
  network: Network,
  records?: RecordMap | undefined,
) => {
  const source = new RecordSource(records);
  const store = new Store(source);

  return new Environment({
    network,
    store,
  });
};
