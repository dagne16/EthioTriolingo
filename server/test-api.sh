#!/usr/bin/env bash
# Quick end-to-end test of the EthioLingo backend API.
# Usage:
#   1. In one terminal: cd server && npm start
#   2. In another terminal: ./server/test-api.sh
#
# Uses a fresh random email each run so you can run it repeatedly
# without hitting "account already exists" errors.

set -e
BASE="http://localhost:3000/api"
EMAIL="test-$(date +%s)@example.com"
PASS=0
FAIL=0

check() {
  local label="$1"; local expected="$2"; local actual="$3"
  if [ "$expected" == "$actual" ]; then
    echo "  ✅ $label"
    PASS=$((PASS+1))
  else
    echo "  ❌ $label — expected $expected, got $actual"
    FAIL=$((FAIL+1))
  fi
}

echo "== 0. Health check =="
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/health")
check "GET /health returns 200" "200" "$STATUS"

echo
echo "== 1. Sign up a new user =="
SIGNUP_RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$EMAIL\",\"password\":\"password123\",\"gender\":\"female\",\"baseLanguage\":\"amharic\",\"preferredCourse\":\"spanish\",\"avatarColor\":\"blue\"}")
SIGNUP_STATUS=$(echo "$SIGNUP_RES" | tail -1)
SIGNUP_BODY=$(echo "$SIGNUP_RES" | sed '$d')
check "POST /auth/signup returns 201" "201" "$SIGNUP_STATUS"
TOKEN=$(echo "$SIGNUP_BODY" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).token||'')}catch{console.log('')}})")
[ -n "$TOKEN" ] && echo "  ✅ received a token" && PASS=$((PASS+1)) || { echo "  ❌ no token in response"; FAIL=$((FAIL+1)); }

echo
echo "== 2. Duplicate signup should fail =="
DUP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Dupe\",\"email\":\"$EMAIL\",\"password\":\"password123\"}")
check "POST /auth/signup (duplicate email) returns 409" "409" "$DUP_STATUS"

echo
echo "== 3. Login with wrong password should fail =="
WRONG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"wrong-password\"}")
check "POST /auth/login (wrong password) returns 401" "401" "$WRONG_STATUS"

echo
echo "== 4. Login with correct password should succeed =="
LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"password123\"}")
check "POST /auth/login (correct password) returns 200" "200" "$LOGIN_STATUS"

echo
echo "== 5. Accessing /auth/me without a token should fail =="
NOAUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/auth/me")
check "GET /auth/me (no token) returns 401" "401" "$NOAUTH_STATUS"

echo
echo "== 6. Accessing /auth/me with a token should succeed =="
ME_RES=$(curl -s -w "\n%{http_code}" "$BASE/auth/me" -H "Authorization: Bearer $TOKEN")
ME_STATUS=$(echo "$ME_RES" | tail -1)
check "GET /auth/me (with token) returns 200" "200" "$ME_STATUS"

echo
echo "== 7. Award XP =="
XP_RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/me/xp" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"amount":50}')
XP_STATUS=$(echo "$XP_RES" | tail -1)
XP_BODY=$(echo "$XP_RES" | sed '$d')
check "POST /auth/me/xp returns 200" "200" "$XP_STATUS"
XP_VALUE=$(echo "$XP_BODY" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).user.xp))")
check "XP is now 50" "50" "$XP_VALUE"

echo
echo "== 8. Mark a lesson unit complete =="
PROG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/progress" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"courseId":"spanish","unitId":"unit1"}')
check "POST /progress returns 201" "201" "$PROG_STATUS"

echo
echo "== 9. Fetch progress list =="
GETPROG_RES=$(curl -s "$BASE/progress" -H "Authorization: Bearer $TOKEN")
UNIT_PRESENT=$(echo "$GETPROG_RES" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const p=JSON.parse(d).progress;console.log(p.some(x=>x.unitId==='unit1'&&x.courseId==='spanish'))})")
check "unit1 appears in progress list" "true" "$UNIT_PRESENT"

echo
echo "== 10. Leaderboard includes this user =="
LB_RES=$(curl -s "$BASE/leaderboard")
ON_BOARD=$(echo "$LB_RES" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const lb=JSON.parse(d).leaderboard;console.log(lb.some(x=>x.xp===50))})")
check "a user with 50 XP appears on the leaderboard" "true" "$ON_BOARD"

echo
echo "================================"
echo "  Passed: $PASS   Failed: $FAIL"
echo "================================"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
