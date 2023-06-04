import type {
  stableCopy as stableCopyType,
  Environment as EnvironmentType,
  Store as StoreType,
  RecordSource as RecordSourceType,
} from 'relay-runtime';

import stableCopyPkg from 'relay-runtime/lib/util/stableCopy';
import EnvironmentPkg from 'relay-runtime/lib/store/RelayModernEnvironment';
import StorePkg from 'relay-runtime/lib/store/RelayModernStore';
import RecordSourcePkg from 'relay-runtime/lib/store/RelayRecordSource';

export const stableCopy = stableCopyPkg as typeof stableCopyType;
export const Environment = EnvironmentPkg as typeof EnvironmentType;
export const Store = StorePkg as typeof StoreType;
export const RecordSource = RecordSourcePkg as unknown as typeof RecordSourceType;


