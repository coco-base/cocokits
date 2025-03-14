import { useState } from 'react';

import { useImmediatelyEffect } from './use-immediately-effect';

/**
 * Represents the state of an asynchronous operation.
 *
 * This interface encapsulates the three possible states of a promise:
 * loading, error, or success with result.
 *
 * @template T The type of the result data when the promise resolves successfully
 *
 * @property {boolean} loading - True when the promise is pending, false once completed (either success or error)
 * @property {any} error - Contains the error if the promise was rejected, null otherwise
 * @property {T | null} result - Contains the resolved value if the promise was successful, null otherwise
 */
export interface PromiseState<T> {
  loading: boolean;
  error: any;
  result: T | null;
}

/**
 * A custom hook that executes a promise and manages its loading state.
 *
 * This hook handles the common pattern of fetching data and tracking loading/error states,
 * executing the promise immediately during render and again if the promise function changes.
 *
 * @param {() => Promise<T>} promiseFn - The function that returns a promise to execute
 * @returns {PromiseState<T>} An object containing the loading state, error (if any), and result
 *
 * @example
 * // Usage example:
 * function UserProfile({ userId }) {
 *   const { loading, error, result: user } = usePromise(
 *     () => fetchUserData(userId)
 *   );
 *
 *   if (loading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *
 *   return <UserDetails user={user} />;
 * }
 *
 * @note
 * This hook uses `useImmediatelyEffect` internally, which executes the promise
 * during render rather than after render completion.
 */
export function usePromise<T>(promiseFn: () => Promise<T>) {
  const [state, setState] = useState<PromiseState<T>>({
    loading: true,
    error: null,
    result: null,
  });

  useImmediatelyEffect(() => {
    promiseFn()
      .then((result) => {
        setState({
          loading: false,
          error: null,
          result,
        });
      })
      .catch((error) => {
        setState({
          loading: false,
          error,
          result: null,
        });
      });
  }, [promiseFn]);

  return state;
}
