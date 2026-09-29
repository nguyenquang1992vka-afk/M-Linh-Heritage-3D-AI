# Security Specification — Mê Linh Smart Heritage AI

## 1. Data Invariants
1. **Identity & Ownership**:
   - `/users/{userId}`: `userId` must match `request.auth.uid` and `incoming().uid == request.auth.uid`. Non-admin users cannot self-assign `role == 'admin'` or `role == 'teacher'` with `status == 'active'` during creation.
   - `/studentProgress/{studentId}`: `studentId` must match `request.auth.uid` and `incoming().studentId == request.auth.uid`.
   - `/quizAttempts/{attemptId}`: `incoming().studentId` must match `request.auth.uid` and `exists(/databases/$(database)/documents/users/$(incoming().studentId))` must be true.
   - `/visitorSessions/{sessionId}`: `sessionId` must match `incoming().sessionId` and adhere to `^[a-zA-Z0-9_\-]+$` (max 64 chars).
2. **PII Isolation**:
   - `/users/{userId}` contains `email`. Read/get/list is strictly restricted to the document owner (`resource.data.uid == request.auth.uid`) or `isAdmin()`.
3. **Temporal & Immutable Fields**:
   - `createdAt` must equal `request.time` on creation and remain immutable on update.
   - `updatedAt` must equal `request.time` on both create and update.
4. **Total Array Guarding**:
   - `completedPOIs` is bounded to `<= 10` elements, and if non-empty, `completedPOIs[0]` must be a string `<= 64` chars.
   - `unlockedBadgeIds` is bounded to `<= 20` elements, and if non-empty, `unlockedBadgeIds[0]` must be a string `<= 64` chars.
   - `viewedLocations` is bounded to `<= 10` elements, and if non-empty, `viewedLocations[0]` must be a string `<= 120` chars.

## 2. The "Dirty Dozen" Payloads (All Must Return PERMISSION_DENIED)
1. **Shadow Field Injection**: Creating `/users/{uid}` with extra field `{"isSuperAdmin": true}`.
2. **Privilege Escalation on Create**: Creating `/users/{uid}` with `{"role": "admin"}` by non-admin user.
3. **Role Mutation on Update**: Updating `/users/{uid}` to change `role` from `"student"` to `"admin"`.
4. **Unverified Email Spoof**: Accessing `/users/{uid}` with `email: "nguyenquang1992vka@gmail.com"` but `email_verified: false`.
5. **Cross-User PII Read**: Authenticated user A attempting `get(/users/userB)`.
6. **Blanket List Scraping**: Authenticated user running unconstrained `list(/users)` without filtering `uid == request.auth.uid`.
7. **ID Poisoning**: Creating document with 500-char or special-char ID `../invalid$id`.
8. **String Denial-of-Wallet**: Updating `StudentProgress.name` with a 10,000-character string.
9. **Unbounded Array Injection**: Updating `StudentProgress.completedPOIs` with 50 items.
10. **Array Type Poisoning**: Updating `StudentProgress.completedPOIs` with `[12345]`.
11. **Timestamp Forgery**: Creating `QuizAttempt` with a forged past/future `createdAt` instead of `request.time`.
12. **Orphaned Quiz Attempt**: Creating `QuizAttempt` when parent `/users/{studentId}` does not exist.
