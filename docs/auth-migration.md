# Auth Migration — Phase 2

## TL;DR

- **New code MUST use** `useAuth()` for state checks and wrap protected route trees in `<AuthGuard>`.
- **Old code stays** until you're already touching that file for another reason. Do **not** refactor in isolation.
- The single previously-risky chokepoint (`SessionExpiryHandler`) has been hardened to respect the `reconnecting` state, so the legacy `navigate('/auth')` calls in leaf pages are safe to leave.

## Patterns

### ✅ New pattern (use this for any new route or feature)

```tsx
// In the route tree:
<Route element={<AuthGuard><DashboardLayout /></AuthGuard>}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>

// Inside a component that needs the user:
const { user, state, signOut } = useAuth();
if (state === "reconnecting") return <Skeleton />; // never redirect on this state
```

### ⚠ Legacy pattern (leave existing instances alone)

```tsx
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session?.user) navigate("/auth"); // ← do not add new ones of these
  });
}, []);
```

When you have to touch a file with this pattern for unrelated reasons, prefer migrating it. Otherwise leave it — it's safe (see Risk Audit below).

## Risk Audit (executed Phase 2 Sprint 2)

51 `navigate('/auth')` call sites scanned across `src/`.

| Class | Count | Risk | Action |
| --- | --- | --- | --- |
| Leaf page `useEffect` redirects (Dashboard, Account, Schedule, etc.) | 49 | Low | Leave. They run inside the page; `AuthGuard` will displace them as routes adopt the new pattern. |
| `SessionExpiryHandler` (above-router global) | 2 (SIGNED_OUT, TOKEN_REFRESHED) | Was high — **mitigated** | Hardened to call `isGloballyReconnecting()` and defer the redirect by 2.5s while a refresh is mid-flight. |
| `AuthCallback` terminal OAuth-error redirects | 3 | Low | Leave. Real terminal failure paths, no race possible. |
| `ResetPassword` post-success redirect | 1 | Low | Leave. Intentional UX after password reset. |
| `useSoftballProfile` hook redirect | 1 | Low | Leave. Page-scoped, runs after `AuthGuard`. |

**Zero high-risk suspects remain.** No layout, provider, or above-`AuthGuard` wrapper performs an unguarded redirect.

## Migration order (when you're already in the file)

1. Replace `supabase.auth.getSession()` + `navigate('/auth')` with `const { state } = useAuth()` and a guard at the route level.
2. Delete the local `useEffect` redirect.
3. Verify the route is wrapped in `<AuthGuard>` upstream — if not, wrap it.

That's it. Do not bulk-migrate. Each migration is one line of risk per file.
