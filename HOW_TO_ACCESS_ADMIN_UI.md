# 🎯 How to Access Admin Panel Through UI

## Visual Step-by-Step Guide

### Step 1: Login to the Application

1. Open your browser
2. Navigate to: `http://localhost:5173/login`
3. Enter credentials:
   - **Email**: `admin@nppepro.local`
   - **Password**: `Passw0rd!`
4. Click "Sign In"

---

### Step 2: Find the Admin Panel Link

After successful login, you'll see the main dashboard. Look at the **top-right corner** of the page:

```
┌─────────────────────────────────────────────────┐
│  Logo    [Search...]         🔔  [Your Avatar ▼]│
└─────────────────────────────────────────────────┘
```

**Click on your user avatar** (the profile picture in the top-right corner)

---

### Step 3: Click "Admin Panel" in the Dropdown

A dropdown menu will appear with these options:

```
┌──────────────────┐
│ 👤 Profile       │
│ ⚙️  Settings     │
│ ❓ Help          │
│ ─────────────────│  ← Separator line (only if you're admin)
│ 🔧 Admin Panel   │  ← THIS IS THE ADMIN LINK (blue text)
│ ─────────────────│
│ 🚪 Logout        │
└──────────────────┘
```

**Click on "Admin Panel"** - This will take you to `/admin`

---

### Step 4: Navigate to Questions Management

From the Admin Dashboard (`/admin`), you'll see several admin sections:

- **Users** - User management
- **Questions** ← Click this one
- **Analytics** - Platform statistics
- **Subscriptions** - Subscription management

**Or directly navigate to:** `http://localhost:5173/admin/questions`

---

## 🎨 What You'll See in Admin Questions

### Questions List Page
```
┌────────────────────────────────────────────────────────┐
│  Question Management                    [Add Question] │
│  Manage the question bank and content (X total)        │
├────────────────────────────────────────────────────────┤
│  [Total: X]  [Active: X]  [Inactive: X]  [Topics: X]  │
├────────────────────────────────────────────────────────┤
│  Search: [___]  Topic: [___]  Type: [___]  Diff: [___]│
├────────────────────────────────────────────────────────┤
│  ☐  Question        Topic      Type    Diff   Actions │
│  ☐  What is...      Engineering Single  Med   [E][D][X]│
│  ☐  Calculate...    Math        Multi   Hard  [E][D][X]│
└────────────────────────────────────────────────────────┘
```

### Create/Edit Question Page
```
┌────────────────────────────────────────────────────────┐
│  ← Create New Question                                 │
│  Add a new question to the question bank               │
├────────────────────────────────────────────────────────┤
│  Question Content *                                    │
│  [_____________________________________________]        │
│                                                         │
│  Question Type: [Single Choice ▼]  Difficulty: [Med ▼]│
│  Topic: [Select ▼]  SubTopic: [Select ▼]              │
│                                                         │
│  Answer Options *                           [+ Add]     │
│  ◯ [Option 1 text_________________________]  [×]       │
│  ◯ [Option 2 text_________________________]  [×]       │
│                                                         │
│  Explanation: [_______________________________]        │
│  Reference: [_________________________________]        │
│                                                         │
│  ☑ Active (visible to users)                          │
│                                      [Cancel] [Create] │
└────────────────────────────────────────────────────────┘
```

---

## ⚠️ Important Notes

### Admin Link Only Shows If:
1. You are logged in
2. Your account has `is_admin = true` in the database
3. Your JWT token includes the admin flag

### If You Don't See "Admin Panel":

**Check 1: Verify admin status in database**
```powershell
$env:PGPASSWORD = "StrongP@ss_123"
psql -U nppe -d nppe -h 127.0.0.1 -c "SELECT email, is_admin, is_verified FROM users WHERE email = 'admin@nppepro.local';"
Remove-Item Env:\PGPASSWORD
```

Should show `is_admin = t` (true)

**Check 2: Re-login**
1. Logout (click avatar → Logout)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login again

**Check 3: Promote user again**
```powershell
$env:PGPASSWORD = "StrongP@ss_123"
psql -U nppe -d nppe -h 127.0.0.1 -f promote_admin.sql
Remove-Item Env:\PGPASSWORD
```

Then logout and login again.

---

## 🎯 Quick Access Shortcuts

Once you're an admin, bookmark these URLs:

- **Admin Dashboard**: `http://localhost:5173/admin`
- **Manage Questions**: `http://localhost:5173/admin/questions`
- **Create Question**: `http://localhost:5173/admin/questions/new`
- **Manage Users**: `http://localhost:5173/admin/users`
- **Analytics**: `http://localhost:5173/admin/analytics`

---

## ✅ Success Checklist

Before expecting to see admin features:

- [ ] Backend running on port 8080
- [ ] Frontend running on port 5173
- [ ] Database migration applied (Step 1)
- [ ] Admin user created (`setup_admin.ps1`)
- [ ] User promoted to admin (`promote_admin.sql`)
- [ ] Logged in to the application
- [ ] Can see "Admin Panel" in user dropdown

If all checkboxes are ✅ and you still don't see the admin link:
- Check browser console (F12) for JavaScript errors
- Verify the Header component updated (check file modification time)
- Hard refresh the page (Ctrl+Shift+R)

---

## 🎉 You're All Set!

Once you see the "Admin Panel" link in your user dropdown, you have full access to the questions management system. Enjoy the fully-featured admin interface!