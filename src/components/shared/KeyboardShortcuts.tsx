import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { setupKeyboardShortcuts } from '../../utils/accessibility';

/**
 * Component that sets up keyboard shortcuts
 */
export function KeyboardShortcuts() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const cleanup = setupKeyboardShortcuts(dispatch);
    return cleanup;
  }, [dispatch]);

  return null;
}

