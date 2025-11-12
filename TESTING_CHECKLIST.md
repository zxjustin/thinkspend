# ThinkSpend Project - End-to-End Testing Checklist

**Purpose**: Verify all features work as described in FYP Report (Chapters 4-8)
**Target**: Ensure 100% consistency between implementation and report claims
**Report Alignment**: Chapter 5 (System Design) must match all UI screenshots

---

## PHASE 1: SETUP & VERIFICATION

### Test 1.1: Environment & Build
- [ ] Run `npm install` - all dependencies installed
- [ ] Run `npm run dev` - Vite dev server starts without errors
- [ ] App loads at `http://localhost:5173` (or configured port)
- [ ] No console errors on initial load
- [ ] Browser DevTools shows clean console (no red errors)

**Evidence**: Screenshot showing clean console and loaded app

### Test 1.2: Authentication
- [ ] Login page displays
- [ ] Can sign up with new email/password
- [ ] Can log in with valid credentials
- [ ] JWT token stored in browser (check Application tab)
- [ ] Can log out and return to login page
- [ ] Cannot access app without authentication (redirects to login)

**Evidence**: Screenshot of login page and authenticated dashboard

---

## PHASE 2: CORE UI & NAVIGATION

### Test 2.1: Main Layout (AppLayout.vue)
- [ ] Three-panel layout visible (left sidebar, center, right panel)
- [ ] Left panel: Navigation tree with folders/notes
- [ ] Center panel: Rich text editor with toolbar
- [ ] Right panel: Connections panel (collapsible)
- [ ] Top navigation: Notes / Expenses / Search / Knowledge Graph tabs
- [ ] Logout button visible in top-right

**Evidence**: Screenshot of full dashboard layout

### Test 2.2: Folder Hierarchy (NoteSidebar.vue)
- [ ] "New Folder" button creates new folders
- [ ] Can create nested folders (folder inside folder)
- [ ] Folders expand/collapse on click
- [ ] Can drag-and-drop folders (if implemented) or at least see hierarchy
- [ ] Folder icons are distinct from note icons (light gray vs blue)
- [ ] Badges show on folders:
  - Green badge with $ icon = number of expenses in notes under that folder
  - Number badge = total wiki-links in notes under that folder

**Expected**: If folder has 2 notes with expenses, should see "$ 2" badge

**Evidence**: Screenshot showing folder hierarchy with badges

### Test 2.3: Note Creation & Selection
- [ ] Click folder → can create new note inside it
- [ ] New note opens in center panel with empty editor
- [ ] Can enter note title in title bar
- [ ] Clicking different notes switches content in center panel
- [ ] Note title updates in left sidebar immediately
- [ ] Recently edited notes appear in "Recent" section

**Evidence**: Screenshot showing multiple notes in folder

---

## PHASE 3: EXPENSE DETECTION & HIGHLIGHTING

### Test 3.1: Valid Expense Pattern (`$amount description [category]`)

Create a note with this content:
```
I spent $25 Lunch [Food]
```

**Verify**:
- [ ] Text `$25 Lunch [Food]` has **yellow background highlight** (bg-yellow-200)
- [ ] Expense counter badge shows "1" in the note's sidebar entry
- [ ] In Expenses view, new expense appears in table:
  - Date: today
  - Description: "Lunch"
  - Category: "Food" (with color-coded badge - green for Food)
  - Amount: "$25.00"
  - Related Notes: links to this note

**Evidence**: Screenshot showing:
1. Yellow-highlighted expense in note
2. Expense counter badge
3. Expense in Expenses table

### Test 3.2: Multiple Valid Expenses in One Note

Create a note with:
```
Day out:
$15 Coffee [Food]
$50 Gas [Transport]
$200 Adobe Creative Cloud [Software]
```

**Verify**:
- [ ] All three have yellow background
- [ ] Expense counter shows "3"
- [ ] All three appear in Expenses table
- [ ] Categories color-coded correctly (Food=green, Transport=?, Software=blue)

**Evidence**: Screenshot showing multi-expense note

### Test 3.3: Invalid Expense Pattern - Missing Brackets

Create a note with:
```
I spent $50 Groceries Food
```

**Verify**:
- [ ] NO yellow highlighting (brackets are required)
- [ ] Expense counter shows "0"
- [ ] Does NOT appear in Expenses table
- [ ] No errors in console

**Evidence**: Screenshot showing no highlight for invalid pattern

### Test 3.4: Invalid Expense Pattern - Invalid Category

Create a note with:
```
$100 Office Supplies [InvalidCategory]
```

**Verify**:
- [ ] **RED background highlight** (not yellow)
- [ ] Expense counter shows "0" OR shows as invalid
- [ ] Does NOT appear in Expenses table (or marked as invalid)
- [ ] Valid categories list shows in editor help (Food, Transport, Software, Marketing, Services, Entertainment, Health, Education, Utilities, Other)

**Evidence**: Screenshot showing red-highlighted invalid expense

### Test 3.5: Edge Cases

Test each (all should be handled gracefully):

1. **Decimal amounts**: `$50.99 Coffee [Food]`
   - [ ] Highlights yellow
   - [ ] Appears as $50.99 in table
   - [ ] No errors

2. **Large amounts**: `$10000 Equipment [Office]`
   - [ ] Highlights yellow
   - [ ] Appears as $10,000.00 in table
   - [ ] No errors

3. **Spaces in description**: `$100 Project Setup Costs [Software]`
   - [ ] Highlights yellow
   - [ ] Description in table: "Project Setup Costs"
   - [ ] No errors

4. **Spaces in category**: `$50 Coffee [Meals & Drinks]` (if supported)
   - [ ] Either highlights (if category is valid) or red (if invalid)
   - [ ] Handles gracefully either way

5. **HTML content** (from rich text editor):
   ```
   <p>I spent <strong>$25 Lunch [Food]</strong></p>
   ```
   - [ ] Still detects and highlights the expense inside HTML
   - [ ] No double-highlighting issues

6. **Unicode characters**: `$250 Café français [Meals]`
   - [ ] Highlights yellow
   - [ ] Appears correctly in table
   - [ ] No encoding issues

7. **Multiple $ signs in same note**:
   ```
   Cost adjustment: $50 adjustment [Other]
   ```
   - [ ] Correctly parses first valid pattern
   - [ ] Doesn't get confused by multiple $

**Evidence**: Screenshot for each edge case

---

## PHASE 4: AUTO-SAVE FUNCTIONALITY

### Test 4.1: Save Status Indicator

While editing a note:
1. Type some text
2. Look at title bar (top of center panel)

**Verify**:
- [ ] After typing pauses for ~2 seconds:
  - [ ] Title shows "Saving..." with spinner icon (gray)
  - [ ] Icon is visible and animated
- [ ] After save completes:
  - [ ] Title shows "Saved" with checkmark icon (green)
  - [ ] Icon appears within 1-3 seconds
- [ ] If save fails:
  - [ ] Title shows "Error" with X icon (red)
  - [ ] Red error indicator visible

**Expected Behavior**:
- Type text → 2-second wait → "Saving..." → "Saved" ✓

**Evidence**: Sequence of 3 screenshots (Saving/Saved/None states)

### Test 4.2: Data Persistence

1. Create a note: "Test Note Content"
2. Add expense: `$50 Test [Food]`
3. Wait for "Saved" indicator
4. Refresh page (F5)

**Verify**:
- [ ] Note content still there
- [ ] Expense still appears in Expenses table
- [ ] Expense counter still shows "1"
- [ ] No data lost

**Evidence**: Screenshot after refresh showing same data

### Test 4.3: Auto-Save with Expense Detection

1. Type text
2. Continue typing to form expense pattern: `$50 test [Food]`
3. Watch save indicator

**Verify**:
- [ ] As expense pattern forms, yellow highlight appears
- [ ] Save triggered automatically
- [ ] Expense counter updates
- [ ] Expense appears in Expenses table after save
- [ ] All happens seamlessly (no lag, no flickering)

**Evidence**: Screenshot showing yellow highlight + Expenses table updated

### Test 4.4: Concurrent Notes Saving

1. Open Note A, type some text
2. Switch to Note B, type different text
3. Switch to Note C, add expense
4. Watch all three save independently

**Verify**:
- [ ] Each note saves without interfering with others
- [ ] Expense appears in Expenses table (linked to Note C)
- [ ] When you switch back to Note A, your text is there
- [ ] When you switch to Note B, your text is there
- [ ] No cross-contamination between notes

**Evidence**: Screenshot of Expenses table showing expense, then switching notes

---

## PHASE 5: CROSS-NOTE DISCOVERY & LINKING

### Test 5.1: Automatic Link Discovery

**Setup**:
1. Create "Project Planning" note with content:
   ```
   Q3 2024 Design Project
   Budget: $5000
   Tools: Adobe Creative Cloud
   ```

2. Create second note with expense:
   ```
   $250 Adobe Creative Cloud subscription [Software]
   ```

**Expected Behavior** (from Chapter 6.1):
- System extracts terms: ["adobe", "creative", "cloud", "software"]
- Searches across all user's notes
- Finds "Project Planning" note contains: "Adobe", "Creative Cloud"
- Calculates relevance score
- If score ≥ threshold (0.3), creates automatic link

**Verify**:
- [ ] Right panel (Connections) shows new automatic link:
  - Format: "Related to: Project Planning (0.XX)" where XX is relevance score
  - Link type shows as "context" or similar
  - Shows the keyword matches that triggered the link

**Example Display**:
```
Links
─────
Related to: Project Planning (0.85)
  Adobe (3.0) + Creative (3.0) + Cloud (3.0) = 9.0 relevance
```

- [ ] User can click link to navigate to "Project Planning" note
- [ ] Clicking opens that note in center panel

**Evidence**: Screenshot showing:
1. First note (Project Planning) content
2. Second note (Expense) with yellow highlight
3. Right panel showing discovered link with relevance score

### Test 5.2: Multiple Link Discovery

Create three notes:
1. **Note A** (Project): "Adobe Creative Suite Design Project Q1"
2. **Note B** (Budget): "Software purchases under $300"
3. **Note C** (Expense): "$250 Adobe Creative Cloud [Software]"

**Verify**:
- [ ] Right panel shows links to BOTH Note A and Note B
- [ ] Both links ranked by relevance (highest first)
- [ ] Each shows different scores
- [ ] Example expected:
  - Note A: 0.9 (all keywords match)
  - Note B: 0.45 (some keywords match)

**Evidence**: Screenshot of right panel showing multiple ranked links

### Test 5.3: No False Positives

Create notes that should NOT link:

**Note X**: "I like ice cream"
**Note Y**: `$5 Ice Cream [Food]`

**Verify**:
- [ ] Despite "ice" and "cream" being common words, they get filtered out as stop words
- [ ] No false link created (or if one appears, relevance is very low)
- [ ] System prioritizes meaningful keywords over common words

**Evidence**: Screenshot showing these notes don't create spurious links

### Test 5.4: Link Persistence

After creating the automatic links above:
1. Close and reopen the app (log back in)
2. Navigate to the expense note

**Verify**:
- [ ] The automatic links are still there
- [ ] Links persist across sessions
- [ ] Data not lost

**Evidence**: Screenshot after refresh showing same links

---

## PHASE 6: MANUAL WIKI-LINKS

### Test 6.1: Create Manual Wiki-Link

In a note, type:
```
For more details see [[Project Planning]]
```

**Verify**:
- [ ] Text `[[Project Planning]]` appears in special format (likely different styling)
- [ ] When you save, right panel shows:
  - New "Links" section with "Linked to: [[Project Planning]]"
  - Strength: 1.0 (manual links have full strength)
  - Can distinguish from auto-discovered links (which have < 1.0)

**Evidence**: Screenshot showing wiki-link in editor and right panel

### Test 6.2: Multiple Wiki-Links

In one note, type:
```
See also: [[Budget Planning]] and [[Q4 Goals]]
```

**Verify**:
- [ ] Both links appear in right panel
- [ ] Both are clickable
- [ ] Can navigate to both referenced notes
- [ ] No duplicates even if same link appears twice

**Evidence**: Screenshot showing multiple wiki-links in right panel

### Test 6.3: Bidirectional Links (Backlinks)

After creating `[[Project Planning]]` link from Note A to Note B:

**Navigate to Project Planning note**:

**Verify**:
- [ ] Right panel shows backlink:
  - "Linked from: [Note A Title]" or similar
  - Indicates the link relationship is bidirectional
  - Can click to go back

**Evidence**: Screenshot of backlinks in Project Planning note

### Test 6.4: Broken Links

Create a link to non-existent note:
```
See [[Non-Existent Note Title]]
```

**Verify**:
- [ ] System handles gracefully (doesn't error)
- [ ] Either:
  - Shows as valid link (user can create the note later), or
  - Shows as broken/warning (if you want to indicate missing target)
- [ ] No console errors

**Evidence**: Screenshot showing how broken links are handled

---

## PHASE 7: CONNECTIONS PANEL (RIGHT SIDEBAR)

### Test 7.1: Panel Display

On the right side of center panel:

**Verify**:
- [ ] "Connections" header visible
- [ ] Collapsible sections:
  - **Expenses**: Shows auto-discovered links to expenses
  - **Links**: Shows manual wiki-links
- [ ] Can expand/collapse each section
- [ ] Each link shows:
  - Title or name
  - Relevance score (for auto-discovered)
  - Strength indicator (visual or numeric)

**Evidence**: Screenshot of expanded connections panel

### Test 7.2: Link Navigation

Click on any link in Connections panel:

**Verify**:
- [ ] Center panel switches to that note's content
- [ ] Sidebar highlights the selected note
- [ ] Smooth transition (no jarring refresh)
- [ ] You can navigate back to original note

**Evidence**: Screenshot sequence (Note A → click link → Note B → click note → back to A)

---

## PHASE 8: EXPENSES VIEW

### Test 8.1: Expenses Table

Click "Expenses" tab at top:

**Verify**:
- [ ] Table displays with columns:
  - Date (today's date for newly added expenses)
  - Description (from expense notation)
  - Category (color-coded badge)
  - Amount (formatted with $, commas for thousands)
  - Related Notes (count of linked notes)
  - Link Strength (0.0-1.0 progress bar or indicator)

**Evidence**: Screenshot of expenses table

### Test 8.2: Expense Filtering

In Expenses view:

**Verify**:
- [ ] **Date Filter**: Can click date header to filter by range
- [ ] **Category Filter**: Toggle buttons for each category (Food, Transport, Software, etc.)
- [ ] **Strength Filter**: "Strong Links" checkbox to show strength ≥ 0.5
- [ ] **Search**: Text search by description (real-time, 300ms debounce)
- [ ] Filters work independently and in combination
- [ ] Row count updates as filters applied

**Evidence**: Screenshots showing:
1. All expenses
2. Filtered by category (e.g., Food only)
3. Filtered by strength
4. Search results

### Test 8.3: Expense Sorting

Click column headers:

**Verify**:
- [ ] Can sort by Date (ascending/descending)
- [ ] Can sort by Amount (ascending/descending)
- [ ] Sort indicator shows which direction (arrow up/down)
- [ ] Works smoothly without lag

**Evidence**: Screenshot showing sorted results

### Test 8.4: Link to Note from Expense

Click on "Related Notes" count/link:

**Verify**:
- [ ] Navigates to or highlights the related note
- [ ] Shows the note content in center panel
- [ ] Can see the expense in context

**Evidence**: Screenshot navigating from expense to note

---

## PHASE 9: SEARCH FUNCTIONALITY

### Test 9.1: Search Interface

Click "Search" tab:

**Verify**:
- [ ] Search input field at top
- [ ] Placeholder text indicates what can be searched
- [ ] Real-time results as you type (300ms debounce)

**Evidence**: Screenshot of search page

### Test 9.2: Search Notes

Type in search:
```
Adobe
```

**Verify**:
- [ ] Results show notes containing "Adobe"
- [ ] Each result shows:
  - Note title
  - Preview snippet (100 characters)
  - Link count
  - Date
- [ ] Click to navigate to note
- [ ] Search is case-insensitive

**Evidence**: Screenshot of search results

### Test 9.3: Search Expenses

Same search "Adobe" should also show:

**Verify**:
- [ ] Expense entries with "Adobe" in description
- [ ] Shows: Description, Category, Amount, Linked Notes
- [ ] Can distinguish note vs. expense results
- [ ] Click to navigate to expense context

**Evidence**: Screenshot showing mixed note + expense results

### Test 9.4: Empty Search

Clear search or type something that doesn't exist:

**Verify**:
- [ ] Shows "No results" message
- [ ] No errors
- [ ] Search doesn't hang or lag

**Evidence**: Screenshot of empty results

---

## PHASE 10: KNOWLEDGE GRAPH VISUALIZATION

### Test 10.1: Graph Loads

Click "Knowledge Graph" tab:

**Verify**:
- [ ] D3.js graph renders without errors
- [ ] Force-directed layout shows:
  - Blue circles = notes (size ∝ connections)
  - Green circles = expenses (size ∝ amount)
  - Lines between nodes = links
- [ ] Graph is interactive and responsive

**Evidence**: Screenshot of knowledge graph

### Test 10.2: Graph Interaction

In graph:

**Verify**:
- [ ] Can drag nodes around
- [ ] Nodes snap back to layout when released
- [ ] Can zoom in/out (scroll wheel or pinch)
- [ ] Hover over node shows tooltip/label
- [ ] Click node navigates to that note/expense
- [ ] Performance is smooth (no lag even with 100+ nodes)

**Evidence**: Video or sequence of screenshots showing interaction

### Test 10.3: Graph Link Types

**Verify**:
- [ ] Dashed lines = auto-discovered links (thickness ∝ relevance)
- [ ] Solid lines = manual wiki-links
- [ ] Can visually distinguish link types
- [ ] Line colors indicate something (strength? type?)

**Evidence**: Screenshot with legend or annotation

### Test 10.4: Graph Renders Efficiently

With 100+ notes:

**Verify**:
- [ ] Renders in < 500ms (per Chapter 5.3.4 requirement)
- [ ] No lag when dragging nodes
- [ ] Frame rate stays high (60 FPS ideally)
- [ ] Uses canvas rendering (not SVG) for performance

**Evidence**: Performance measurement or smooth interaction screenshot

---

## PHASE 11: EDITOR FEATURES

### Test 11.1: Rich Text Formatting

In note editor:

**Verify**:
- [ ] Formatting toolbar visible:
  - Bold (B button)
  - Italic (I button)
  - Lists (bullet, ordered)
  - Links (chain icon)
- [ ] Can select text and apply formatting
- [ ] Formatting applies correctly
- [ ] Can toggle formatting on/off

**Evidence**: Screenshot of formatted text

### Test 11.2: Heading Support

Type or apply heading styles:

**Verify**:
- [ ] H1-H6 headings supported
- [ ] Headings render visually distinct
- [ ] Hierarchy reflected in outline/structure (if shown)
- [ ] Headings color-coded (per Chapter 5.3.2)

**Evidence**: Screenshot showing multi-level headings

### Test 11.3: Paste HTML Content

Copy formatted content from web, paste into editor:

**Verify**:
- [ ] HTML is accepted and formatted
- [ ] Expense detection still works inside HTML
- [ ] No strange formatting artifacts
- [ ] Editor handles rich content gracefully

**Evidence**: Screenshot of pasted HTML content

---

## PHASE 12: DATABASE & SECURITY

### Test 12.1: Row-Level Security (RLS)

**Setup two user accounts**: User A and User B

**Verify**:
- [ ] User A logs in, creates notes and expenses
- [ ] User A logs out, User B logs in
- [ ] User B cannot see User A's notes or expenses
- [ ] User B's data is completely isolated
- [ ] No data leakage between users

**Evidence**: Screenshots from both users showing isolation

### Test 12.2: Database Integrity

**Verify**:
- [ ] All notes persisted correctly
- [ ] Expense amounts stored accurately (no floating-point errors)
- [ ] Links persist correctly
- [ ] No data duplication
- [ ] Cascading deletes work (deleting note removes its links)

**Evidence**: Database queries or table screenshots

---

## PHASE 13: TEST SUITE EXECUTION

### Test 13.1: Run All Tests

Run:
```bash
npm test
```

or

```bash
npm run test
```

**Verify**:
- [ ] All 72 tests pass (49 unit + 10 integration + 13 performance)
- [ ] 100% pass rate (0 failures)
- [ ] No timeout errors
- [ ] No deprecation warnings
- [ ] Test execution completes in reasonable time (< 2 minutes ideally)

**Evidence**: Terminal output showing test results

**Expected Output**:
```
✓ 49 unit tests
✓ 10 integration tests
✓ 13 performance tests
────────────────────────
✓ 72 tests passed
```

### Test 13.2: Test Coverage

**Verify**:
- [ ] Line coverage: 80%+
- [ ] Function coverage: 80%+
- [ ] Branch coverage: 80%+
- [ ] All critical business logic covered

**Run**:
```bash
npm test -- --coverage
```

**Evidence**: Coverage report showing percentages

### Test 13.3: Performance Tests

**Verify**:
- [ ] Expense parsing: < 50ms ✓ (measured ~12ms)
- [ ] Link detection: < 30ms ✓ (measured ~8ms)
- [ ] Discovery (100 notes): < 500ms ✓ (measured ~23ms)
- [ ] Discovery (500 notes): < 2000ms ✓ (measured ~412ms)

**Evidence**: Test output showing performance times

---

## PHASE 14: REPORT ALIGNMENT & SCREENSHOTS

### Test 14.1: Screenshot Consistency

For Chapter 5 (System Design):

**Section 5.3.2 - Main Interface: Three-Panel Layout**
- [ ] Take screenshot matching Figure 5.2 description
- [ ] Verify:
  - Left panel: Folders + notes visible
  - Center panel: Editor with toolbar
  - Right panel: Connections panel
  - All elements match report description
  - Yellow/red highlights visible for expenses

**Evidence**: Screenshot saved as `Figure5.2_current.png`

**Section 5.3.3 - Expense Tracking Interface**
- [ ] Take screenshot of Expenses view matching Figure 5.3
- [ ] Verify:
  - Table columns match description (Date, Description, Category, Amount, Related Notes, Strength)
  - Category color-coding matches (Food=green, Software=blue, etc.)
  - Filters visible and working

**Evidence**: Screenshot saved as `Figure5.3_current.png`

### Test 14.2: Feature Descriptions Match Reality

Go through each section of Chapter 5 and verify:

- [ ] 5.3.1 - Design Principles:
  - Transparency ✓ (links show keyword matches)
  - Imperceptibility ✓ (operations <100ms)

- [ ] 5.3.2 - Three-Panel Layout:
  - Left: Hierarchical navigation ✓
  - Center: Rich text editor ✓
  - Right: Connections panel ✓
  - All described features visible

- [ ] 5.3.3 - Expense Tracking:
  - Filterable table ✓
  - Color-coded badges ✓
  - Real-time search ✓
  - Link strength display ✓

- [ ] 5.3.4 - Search & Graph:
  - SearchView with debounce ✓
  - GraphView with D3.js ✓
  - Interactive nodes ✓

### Test 14.3: Implementation Details Match Report

Verify from code:

- [ ] Chapter 6.1: Algorithm threshold (0.3 or 4.0?) - **VERIFY WHICH IS ACTUALLY USED**
- [ ] Chapter 6.2: Expense pattern regex matches descriptions
- [ ] Chapter 6.3: Auto-save delay is 2000ms
- [ ] Chapter 6.4: RLS policies enforce user_id = auth.uid()
- [ ] Chapter 5.4: Technology versions match (Vue 3, Pinia, Supabase, etc.)

**Evidence**: Code snippets showing key constants

---

## PHASE 15: FINAL CONSISTENCY CHECK

### Test 15.1: Cross-Chapter Consistency

**Verify**:
- [ ] Chapter 4 (Requirements) - All 9 requirements met
- [ ] Chapter 5 (Design) - Design matches implementation
- [ ] Chapter 6 (Implementation) - Code matches design
- [ ] Chapter 7 (Testing) - All tests exist and pass
- [ ] Chapter 8 (Evaluation) - Evaluation matches testing results

### Test 15.2: Performance Claims Match Reality

**Verify all numbers in report are accurate**:

From Chapter 6.1.3:
- [ ] "Measured 11.41ms (per-note: 0.114ms)" for 100 notes ✓
- [ ] "Linear scaling confirmed across 10-500 notes" ✓

From Chapter 8.7:
- [ ] All performance targets "exceeded by 70-80%" ✓

From Chapter 5.3:
- [ ] Expense parsing: "12.3ms (73% faster than 50ms target)" ✓
- [ ] Link detection: "8.7ms (71% faster than 30ms target)" ✓

### Test 15.3: Precision Claims

**CRITICAL - VERIFY**:

From Chapter 6.1.2 and Chapter 8.4:
- [ ] Actual implementation precision: 72-78% or 90%+?
- [ ] Which threshold is actually used: 0.3 or 4.0?
- [ ] If 72-78%, ensure Chapter 4 requirement is updated to match

---

## DOCUMENTATION & SIGN-OFF

### Before Taking Screenshots:

1. Create a clean state:
   ```bash
   # Optional: Clear all test data and start fresh
   # Or keep existing data for realistic screenshots
   ```

2. Create screenshot directory:
   ```bash
   mkdir -p /home/zxjustin/repos/thinkspend/screenshots_for_report
   ```

3. For each screenshot:
   - [ ] Clear browser cache (Ctrl+Shift+Delete)
   - [ ] Ensure UI is in the state described in report
   - [ ] Use consistent screen resolution (e.g., 1920x1080)
   - [ ] Use consistent font sizing (100% zoom)
   - [ ] Remove personal data (use test email/names)
   - [ ] Save with descriptive name: `Chapter5_Section3.2_MainLayout.png`

### Final Checklist Before Report Submission:

- [ ] All 12 testing phases completed and verified
- [ ] All screenshots taken and match report descriptions
- [ ] Test suite passes 100%
- [ ] No console errors during normal operation
- [ ] Performance benchmarks verified
- [ ] Precision/threshold values confirmed in code and report match
- [ ] All chapters internally consistent
- [ ] No contradictions between chapters
- [ ] Report word count within 9,000-11,000
- [ ] Ready for submission

---

## WHAT TO DO IF SOMETHING FAILS

If any test fails:

1. **Document the issue**:
   - Test number (e.g., "Test 3.1")
   - Expected vs. actual behavior
   - Screenshot of the problem
   - Console errors (if any)

2. **Categorize severity**:
   - **CRITICAL**: Feature doesn't work at all (blocks report claims)
   - **HIGH**: Feature partially broken (compromises report accuracy)
   - **MEDIUM**: UI inconsistency (affects visual alignment)
   - **LOW**: Minor bug (doesn't impact report core claims)

3. **Fix in code**, then:
   - Retest after fix
   - Take new screenshot if needed
   - Update report if description changed

4. **Track changes**:
   ```bash
   git add .
   git commit -m "Fix: [Test that failed and how it was fixed]"
   ```

---

## ESTIMATED TIME

- **Phase 1-2**: 10 minutes (setup, navigation)
- **Phase 3-6**: 30 minutes (expenses, discovery, links)
- **Phase 7-10**: 20 minutes (UI features, graph)
- **Phase 11-13**: 20 minutes (editor, database, tests)
- **Phase 14-15**: 30 minutes (screenshots, alignment check)

**Total**: ~2 hours for complete end-to-end testing

---

## GO TIME! 🚀

Print this document and go through each test systematically. Take screenshots as you go. Mark checkboxes. Document any issues. Your goal: **100% confidence that implementation matches report claims**.

Good luck!
