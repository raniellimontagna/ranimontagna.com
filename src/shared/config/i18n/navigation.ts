/**
 * Type-safe navigation helpers generated from the routing configuration.
 * Use these instead of next/navigation hooks to ensure locale-aware routing.
 *
 * @see https://next-intl.dev/docs/routing/navigation
 */
import { createNavigation } from 'next-intl/navigation'

import { routing } from './routing'

export const { Link, redirect, permanentRedirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
