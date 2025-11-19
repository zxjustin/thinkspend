# ThinkSpend - Simple Video Script

**Total Duration: 5-6 minutes**

---

## **SECTION 1: INTRO (0:00-0:30)**

**What to show**: Login page

**Script:**
> "Hi, this is ThinkSpend - a personal knowledge management app with integrated expense tracking. It lets you organize notes in folders, track expenses inline, and automatically discover connections between them. Let me show you how it works."

**Action**:
- Just show the login page
- Don't click anything yet

---

## **SECTION 2: LOGIN (0:30-0:45)**

**What to show**: Login form filling in and signing in

**Script:**
> "First, let me log in with test credentials."

**Actions**:
1. Click email field
2. Type: `test@example.com`
3. Click password field
4. Type: `password123`
5. Click "Sign In"
6. Wait for page to load

---

## **SECTION 3: MAIN INTERFACE (0:45-2:00)**

**What to show**: The main notes view with sidebar, editor, and connection panel

**Script:**
> "Once logged in, you're in the main notes interface. On the left is a folder tree to organize your notes. In the center is the note editor. On the right is the connection panel showing detected expenses and links."

**Actions**:
1. Click on one of the folders to show the notes inside
2. Click on a note to open it in the editor
3. Point to the right sidebar showing connections

**Keep it simple**: Just show how the interface is organized.

---

## **SECTION 4: EXPENSE TRACKING (2:00-3:15)**

**What to show**: Create a note with expenses

**Script:**
> "The main feature is inline expense tracking. You can type expenses directly in your notes using this simple format: dollar sign, amount, description, then category in square brackets. Let me create an example."

**Actions**:
1. Click in the editor area
2. Clear any existing text (Ctrl+A, Delete)
3. Type this sample note:
```
# Project Meeting Notes

Had a team meeting today.

Expenses:
$45 Team lunch [Food]
$150 Flight ticket [Transport]
$250 Adobe subscription [Software]

See [[Project Planning]] for details
```

4. Watch the status bar - it will show "💲 3 expenses"
5. Look at the right panel - it will show the 3 expenses detected

**Script while typing:**
> "As you can see, I'm typing expenses in the format: dollar amount, description, and category in brackets. The app automatically detects them and shows them on the right panel. Valid categories are: Food, Transport, Software, Marketing, Services, Entertainment, Health, Education, Utilities, and Other."

---

## **SECTION 5: ALGORITHM EXPLANATION (3:15-4:15)**

**What to show**: The connection panel showing auto-discovered links

**Script:**
> "Now here's the intelligent part. When you create an expense, the app runs an algorithm that automatically finds related notes in your system and links them together. It does this in three steps:

> First, it extracts keywords from the expense - like 'Adobe', 'Software' from the software subscription.

> Then it searches all your notes and scores how relevant each note is to those keywords. Notes with the keyword in the title get a higher score.

> Finally, any notes that score above a threshold get automatically linked to the expense. This creates a knowledge graph of connections.

> The beautiful thing is - you don't have to manually link everything. It figures it out automatically."

**Actions**:
- Point to the auto-discovered links shown in the Connection Panel on the right
- Explain that some expenses are already linked to related notes

---

## **SECTION 6: KNOWLEDGE GRAPH (4:15-5:00)**

**What to show**: Open and interact with the graph

**Script:**
> "To visualize all these connections, we have an interactive knowledge graph. Each circle is a note, and the lines show relationships between them."

**Actions**:
1. Click the "Knowledge Graph" button at the top
2. Wait for it to load (1-2 seconds)
3. Drag a node around to show it's interactive
4. Zoom with mouse wheel
5. Click on a node to go back to the note
6. Say: "You can drag nodes around, zoom in and out, and click to view any note. It helps you understand how your notes and expenses are connected."

---

## **SECTION 7: EXPENSES VIEW (5:00-5:30)**

**What to show**: Expenses dashboard

**Script:**
> "We also have an expenses view showing all your tracked expenses, organized by month, with category breakdowns."

**Actions**:
1. Navigate to Expenses view (click in navigation)
2. Point to the left sidebar showing total spending and categories
3. Show the main area with expenses listed
4. Say: "Here you can see all your expenses, category breakdown with progress bars, and date-based filtering. Makes it easy to track where your money is going."

---

## **SECTION 8: CLOSING (5:30-6:00)**

**What to show**: Back to the main interface

**Script:**
> "So in summary, ThinkSpend combines personal knowledge management with expense tracking. The key features are:

> - Simple inline expense format you type right in your notes
> - Automatic discovery that finds related notes
> - A knowledge graph to visualize connections
> - An expenses dashboard to track spending
> - All built on modern web technology with Vue 3, Supabase, and D3.js

> Thanks for watching!"

**Actions**:
- Just show the main interface
- Maybe do a final screenshot-type pause

---

## **QUICK NOTES WHILE RECORDING**

✅ **Speak naturally** - Don't read like a robot
✅ **Pause after actions** - Give viewer time to see what happened
✅ **Move mouse slowly** - People can follow better
✅ **Don't rush** - 5-6 minutes is good, no need to go longer
✅ **Type slowly** - 2 characters per second is fine
✅ **Keep it simple** - You're explaining, not impressing with length

---

## **WHAT TO TYPE IN EDITOR** (Copy-paste ready)

```
# Project Meeting Notes

Had a team meeting today.

Expenses:
$45 Team lunch [Food]
$150 Flight ticket [Transport]
$250 Adobe subscription [Software]

See [[Project Planning]] for details
```

**Valid Categories to mention**:
Food, Transport, Software, Marketing, Services, Entertainment, Health, Education, Utilities, Other

---

## **TIMING BREAKDOWN**

| Section | Time | What |
|---------|------|------|
| Intro | 0:30 | Explain app purpose |
| Login | 0:15 | Sign in demo |
| Interface | 1:15 | Show layout |
| Expenses | 1:15 | Type and explain format |
| Algorithm | 1:00 | Explain auto-discovery |
| Graph | 0:45 | Open and interact |
| Expenses View | 0:30 | Show dashboard |
| Closing | 0:30 | Summary |
| **TOTAL** | **6:00** | |

---

## **BEFORE YOU RECORD**

- [ ] Run `npm run dev`
- [ ] Make sure you're logged in
- [ ] Have this script visible
- [ ] Open OBS Studio or your screen recorder
- [ ] Test your microphone
- [ ] Set screen resolution to 1080p
- [ ] Set browser zoom to 110-125% (so text is readable)

---

## **THAT'S IT!**

Just follow the sections above, read the script naturally, do what it says on screen, and you'll have a perfect 5-6 minute demo video.

You don't need to be perfect - just show how the app works and explain the main features. That's all your lecturer needs to see! 🎬
