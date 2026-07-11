import { useState, useEffect, useCallback, useRef } from "react";

// ================================================
// useDebounce - Debounce value changes
// ================================================
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// ================================================
// useLocalStorage - Persist state in localStorage
// ================================================
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error("useLocalStorage error:", error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue];
};

// ================================================
// usePrevious - Track previous value
// ================================================
export const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

// ================================================
// useOnClickOutside - Detect clicks outside element
// ================================================
export const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

// ================================================
// useMediaQuery - Responsive breakpoint detection
// ================================================
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
};

// ================================================
// useIsMobile - Common mobile detection
// ================================================
export const useIsMobile = () => useMediaQuery("(max-width: 768px)");

// ================================================
// useToggle - Boolean state toggle
// ================================================
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(!!initialValue);
  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  return [value, toggle, setTrue, setFalse];
};

// ================================================
// useAsync - Async operation state management
// ================================================
export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState("idle"); // idle | pending | success | error
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setStatus("pending");
      setValue(null);
      setError(null);
      try {
        const response = await asyncFunction(...args);
        setValue(response);
        setStatus("success");
        return response;
      } catch (err) {
        setError(err);
        setStatus("error");
        throw err;
      }
    },
    [asyncFunction],
  );

  useEffect(() => {
    if (immediate) execute();
  }, [execute, immediate]);

  return { execute, status, value, error, isLoading: status === "pending" };
};
