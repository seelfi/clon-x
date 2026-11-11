import { useCallback, useRef, useState } from "react";
import { followUser, unfollowUser } from "../services/api";

export default function useFollow() {
  const [processingUser, setProcessingUser] = useState(null);
  const operationInProgress = useRef(false);

  const run = useCallback(async (action, username) => {
    if (operationInProgress.current) return false;

    operationInProgress.current = true;
    setProcessingUser(username);

    try {
      return await action(username);
    } finally {
      operationInProgress.current = false;
      setProcessingUser(null);
    }
  }, []);

  const follow = useCallback(
    (username) => run(followUser, username),
    [run]
  );

  const unfollow = useCallback(
    (username) => run(unfollowUser, username),
    [run]
  );

  return { processingUser, follow, unfollow };
}
