/** Instance du compte utilisée par l'application. */
import { store } from '@/state/store';
import { AccountSync, browserStorage, useSyncState, type AccountState } from './sync';

export const account = new AccountSync(store, typeof window !== 'undefined' ? browserStorage() : null);

export function useAccount<T>(selector: (s: AccountState) => T): T {
  return useSyncState(account, selector);
}
